import { dbStore } from './store';
import { Reservation, BookCopy } from '@library/shared';

export class ReservationService {
  public getAllReservations(status?: string) {
    let list = dbStore.reservations.map(res => {
      const copy = dbStore.copies.find(c => c.id === res.copyId);
      const book = copy ? dbStore.books.find(b => b.id === copy.bookId) : undefined;
      const user = dbStore.profiles.find(p => p.id === res.userId);
      return {
        ...res,
        copy: copy ? { ...copy, book } : undefined,
        user
      };
    });

    if (status && status !== 'all') {
      list = list.filter(r => r.status === status);
    }

    return list.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }

  public getMyReservations(userId: string) {
    return this.getAllReservations().filter(r => r.userId === userId);
  }

  public requestReservation(copyId: string, userId: string, durationHours: number = 24) {
    const copy = dbStore.copies.find(c => c.id === copyId);
    if (!copy) throw new Error('Book copy not found');

    if (copy.status !== 'AVAILABLE') {
      throw new Error(`Copy ${copy.copyNumber} is currently ${copy.status.toLowerCase()} and cannot be reserved.`);
    }

    const user = dbStore.profiles.find(p => p.id === userId);
    if (!user) throw new Error('User profile not found');

    // Strict Daily Limits (1 book/day for students, 3 books/day for staff)
    const isStudent = user.role === 'STUDENT';
    const dailyLimit = isStudent ? 1 : 3;

    const todayPrefix = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const todayReservations = dbStore.reservations.filter(r =>
      r.userId === userId &&
      r.requestDate.startsWith(todayPrefix) &&
      r.status !== 'CANCELLED' &&
      r.status !== 'REJECTED'
    );

    if (todayReservations.length >= dailyLimit) {
      if (isStudent) {
        throw new Error("Today's reservation limit reached! Students can reserve only 1 book per day. (Return period: 15 days)");
      } else {
        throw new Error("Today's reservation limit reached! Faculty and staff can reserve up to 3 books per day. (Return period: 15 days)");
      }
    }

    // Lock copy temporarily
    copy.status = 'RESERVED';
    copy.updatedAt = new Date().toISOString();
    dbStore.syncBookCounters(copy.bookId);

    const now = new Date();
    const returnDueDate = new Date(now.getTime() + 15 * 24 * 3600000).toISOString(); // 15 days return window

    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      copyId,
      userId,
      status: 'PENDING',
      requestDate: now.toISOString(),
      expiresAt: new Date(now.getTime() + durationHours * 3600000).toISOString(),
      returnDueDate,
      loanDurationDays: 15
    };

    dbStore.reservations.unshift(reservation);

    const book = dbStore.books.find(b => b.id === copy.bookId);

    // Format exact real date and time (e.g. "05 Nov 2026, 12:15 PM")
    const formattedDateTime = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Notify Admin with comprehensive real-time details, exact date/time, and direct link
    dbStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'usr-admin-1',
      targetRole: 'ADMIN',
      title: '🚨 New Book Reservation Request!',
      message: `${user.name} (${user.rollNumber || user.staffId}) reserved copy ${copy.copyNumber} of "${book?.title || 'Department Book'}" on ${formattedDateTime}. Shelf: ${book?.rackLocation || 'Stack'}. Return window: 15 Days.`,
      type: 'RESERVATION',
      link: '/admin/reservations',
      isRead: false,
      createdAt: now.toISOString()
    });

    // Activity log
    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId,
      userName: user.name,
      action: 'RESERVATION_REQUESTED',
      details: `Requested reservation for copy ${copy.copyNumber}`,
      createdAt: new Date().toISOString()
    });

    return reservation;
  }

  public approveReservation(reservationId: string, adminId: string, adminName: string) {
    const res = dbStore.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');

    if (res.status !== 'PENDING') {
      throw new Error(`Reservation is already ${res.status.toLowerCase()}`);
    }

    res.status = 'APPROVED';
    res.approvedAt = new Date().toISOString();
    // 24 hours to collect physically
    res.expiresAt = new Date(Date.now() + 24 * 3600000).toISOString();

    const copy = dbStore.copies.find(c => c.id === res.copyId);
    const user = dbStore.profiles.find(p => p.id === res.userId);

    // Notify Student / Staff
    dbStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: res.userId,
      title: 'Reservation Approved!',
      message: `Your reservation for ${copy?.copyNumber} has been approved. Please collect it within 24 hours.`,
      type: 'RESERVATION',
      link: '/portal/reservations',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: adminId,
      userName: adminName,
      action: 'RESERVATION_APPROVED',
      details: `Approved reservation ${reservationId} for ${user?.name}`,
      createdAt: new Date().toISOString()
    });

    return res;
  }

  public rejectReservation(reservationId: string, reason: string, adminId: string, adminName: string) {
    const res = dbStore.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');

    res.status = 'REJECTED';
    res.rejectionReason = reason || 'Reservation declined by Department Library Administrator.';

    // Free the copy back to AVAILABLE
    const copy = dbStore.copies.find(c => c.id === res.copyId);
    if (copy) {
      copy.status = 'AVAILABLE';
      dbStore.syncBookCounters(copy.bookId);
    }

    // Notify Student / Staff
    dbStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: res.userId,
      title: 'Reservation Rejected',
      message: `Your reservation for copy ${copy?.copyNumber} was rejected: ${res.rejectionReason}`,
      type: 'RESERVATION',
      link: '/portal/reservations',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: adminId,
      userName: adminName,
      action: 'RESERVATION_REJECTED',
      details: `Rejected reservation ${reservationId}. Reason: ${res.rejectionReason}`,
      createdAt: new Date().toISOString()
    });

    return res;
  }

  public cancelReservation(reservationId: string, userId: string) {
    const res = dbStore.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');
    if (res.userId !== userId) throw new Error('Unauthorized to cancel this reservation');
    if (res.status !== 'PENDING' && res.status !== 'APPROVED') {
      throw new Error(`Cannot cancel a reservation that is already ${res.status.toLowerCase()}`);
    }

    res.status = 'CANCELLED';

    const copy = dbStore.copies.find(c => c.id === res.copyId);
    if (copy && copy.status === 'RESERVED') {
      copy.status = 'AVAILABLE';
      dbStore.syncBookCounters(copy.bookId);
    }

    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId,
      userName: dbStore.profiles.find(p => p.id === userId)?.name || 'User',
      action: 'RESERVATION_CANCELLED',
      details: `User cancelled reservation ${reservationId} for copy ${copy?.copyNumber}`,
      createdAt: new Date().toISOString()
    });

    return res;
  }
}

export const reservationService = new ReservationService();
