import { dbStore } from './store';
import { BorrowTransaction, Fine } from '@library/shared';
import { differenceInCalendarDays } from 'date-fns';

export class BorrowService {
  public getAllTransactions(status?: string) {
    let list = dbStore.transactions.map(tx => {
      const copy = dbStore.copies.find(c => c.id === tx.copyId);
      const book = copy ? dbStore.books.find(b => b.id === copy.bookId) : undefined;
      const user = dbStore.profiles.find(p => p.id === tx.userId);
      const fine = dbStore.fines.find(f => f.transactionId === tx.id);

      // Recalculate overdue on the fly
      if (tx.status === 'BORROWED' && new Date() > new Date(tx.dueDate)) {
        tx.status = 'OVERDUE';
        const days = differenceInCalendarDays(new Date(), new Date(tx.dueDate));
        if (days > 0 && !fine) {
          const newFine: Fine = {
            id: `fine-${Date.now()}`,
            transactionId: tx.id,
            userId: tx.userId,
            amount: days * 10, // 10 INR per overdue day
            overdueDays: days,
            status: 'UNPAID'
          };
          dbStore.fines.push(newFine);
          tx.fine = newFine;
        }
      }

      return {
        ...tx,
        copy: copy ? { ...copy, book } : undefined,
        user,
        fine
      };
    });

    if (status && status !== 'all') {
      list = list.filter(t => t.status === status);
    }

    return list.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }

  public getMyBorrowings(userId: string) {
    return this.getAllTransactions().filter(t => t.userId === userId);
  }

  public issueBook(copyId: string, userId: string, days: number = 15, adminId: string, adminName: string) {
    const copy = dbStore.copies.find(c => c.id === copyId);
    if (!copy) throw new Error('Copy not found');

    if (copy.status === 'BORROWED') {
      throw new Error(`Copy ${copy.copyNumber} is already borrowed.`);
    }

    const user = dbStore.profiles.find(p => p.id === userId);
    if (!user) throw new Error('Borrower profile not found');

    if (user.status === 'INACTIVE') {
      throw new Error('User account is inactive. Cannot issue books.');
    }

    const dueDate = new Date(Date.now() + days * 24 * 3600000).toISOString();

    const transaction: BorrowTransaction = {
      id: `tx-${Date.now()}`,
      copyId,
      userId,
      issueDate: new Date().toISOString(),
      dueDate,
      status: 'BORROWED',
      issuedBy: adminId
    };

    // Update copy status
    copy.status = 'BORROWED';
    copy.updatedAt = new Date().toISOString();
    dbStore.syncBookCounters(copy.bookId);

    // If there was an approved reservation, mark it completed/cancelled
    const reservation = dbStore.reservations.find(r => r.copyId === copyId && r.userId === userId && r.status === 'APPROVED');
    if (reservation) {
      reservation.status = 'APPROVED';
      reservation.expiresAt = new Date().toISOString();
    }

    dbStore.transactions.unshift(transaction);

    // Notify user
    dbStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId,
      title: 'Book Issued Successfully',
      message: `Copy ${copy.copyNumber} has been issued to you. Due date: ${dueDate.slice(0, 10)}. Please return on time.`,
      type: 'GENERAL',
      link: '/portal/borrowed',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // Activity log
    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: adminId,
      userName: adminName,
      action: 'BOOK_ISSUED',
      details: `Issued copy ${copy.copyNumber} to ${user.name} (${user.rollNumber || user.staffId})`,
      createdAt: new Date().toISOString()
    });

    return transaction;
  }

  public returnBook(transactionId: string, condition: 'GOOD' | 'DAMAGED' | 'LOST', waiveFine: boolean, adminId: string, adminName: string) {
    const tx = dbStore.transactions.find(t => t.id === transactionId);
    if (!tx) throw new Error('Transaction not found');

    if (tx.status === 'RETURNED') {
      throw new Error('Book copy has already been returned.');
    }

    const copy = dbStore.copies.find(c => c.id === tx.copyId);
    if (!copy) throw new Error('Book copy not found');

    const user = dbStore.profiles.find(p => p.id === tx.userId);

    tx.status = 'RETURNED';
    tx.returnDate = new Date().toISOString();

    // Update copy condition & availability
    if (condition === 'DAMAGED') {
      copy.status = 'DAMAGED';
      copy.conditionNotes = 'Returned with physical damage; requires repair';
    } else if (condition === 'LOST') {
      copy.status = 'LOST';
      copy.conditionNotes = 'Reported lost by borrower';
    } else {
      copy.status = 'AVAILABLE';
      copy.conditionNotes = 'Returned in good condition';
    }
    copy.updatedAt = new Date().toISOString();
    dbStore.syncBookCounters(copy.bookId);

    // Calculate fine if overdue
    const fine = dbStore.fines.find(f => f.transactionId === tx.id);
    if (fine) {
      if (waiveFine) {
        fine.status = 'WAIVED';
      } else {
        fine.status = 'PAID';
        fine.paidAt = new Date().toISOString();
      }
    }

    // Activity Log
    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: adminId,
      userName: adminName,
      action: 'BOOK_RETURNED',
      details: `Processed return for ${copy.copyNumber} from ${user?.name}. Status: ${condition}.`,
      createdAt: new Date().toISOString()
    });

    // Notify User
    if (user) {
      dbStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: user.id,
        title: 'Book Return Confirmed',
        message: `Your return for ${copy.copyNumber} has been verified and processed by the department library.`,
        type: 'GENERAL',
        link: '/portal/history',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return tx;
  }
}

export const borrowService = new BorrowService();
