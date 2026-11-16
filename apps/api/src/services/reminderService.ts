import cron from 'node-cron';
import { dbStore } from './store';
import { differenceInCalendarDays, startOfDay } from 'date-fns';

export class ReminderService {
  private static instance: ReminderService;
  private isRunning: boolean = false;

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  public initCron() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run every hour or daily at 8:00 AM (0 8 * * *)
    // For reliable background operation, check every hour:
    cron.schedule('0 * * * *', () => {
      console.log('[Reminder Cron] Checking book return schedules...');
      this.checkAndSendReminders();
    });

    // Also run an immediate check on startup
    setTimeout(() => {
      this.checkAndSendReminders();
    }, 5000);

    console.log('[Reminder Cron] Automated Return Reminder Scheduler initialized.');
  }

  public checkAndSendReminders() {
    const now = new Date();
    const today = startOfDay(now);

    const activeBorrows = dbStore.transactions.filter(t => t.status === 'BORROWED' || t.status === 'OVERDUE');

    let processedCount = 0;

    for (const tx of activeBorrows) {
      const dueDate = startOfDay(new Date(tx.dueDate));
      const daysUntilDue = differenceInCalendarDays(dueDate, today);
      const user = dbStore.profiles.find(p => p.id === tx.userId);
      const copy = dbStore.copies.find(c => c.id === tx.copyId);
      const book = copy ? dbStore.books.find(b => b.id === copy.bookId) : undefined;

      if (!user || !copy || !book) continue;

      let scheduleKey: string | null = null;
      let title = '';
      let message = '';

      if (daysUntilDue === 15) {
        scheduleKey = '15D';
        title = 'Library Reminder: 15 Days Until Due Date';
        message = `"${book.title}" (Copy: ${copy.copyNumber}) is due in 15 days (${tx.dueDate.slice(0, 10)}).`;
      } else if (daysUntilDue === 7) {
        scheduleKey = '7D';
        title = 'Library Reminder: 7 Days Left';
        message = `"${book.title}" (Copy: ${copy.copyNumber}) is due in 1 week (${tx.dueDate.slice(0, 10)}).`;
      } else if (daysUntilDue === 3) {
        scheduleKey = '3D';
        title = 'Library Alert: 3 Days Until Due Date';
        message = `Friendly reminder: "${book.title}" (Copy: ${copy.copyNumber}) is due in 3 days.`;
      } else if (daysUntilDue === 1) {
        scheduleKey = '1D';
        title = 'Urgent: Book Due Tomorrow';
        message = `"${book.title}" (Copy: ${copy.copyNumber}) is due tomorrow (${tx.dueDate.slice(0, 10)}). Please return to avoid department fines.`;
      } else if (daysUntilDue === 0) {
        scheduleKey = 'DUE_DAY';
        title = 'Action Required: Book Return Due Today';
        message = `Today is the return due date for "${book.title}" (${copy.copyNumber}). Please return it to the ECE Department Library desk.`;
      } else if (daysUntilDue < 0) {
        scheduleKey = `OVERDUE_${Math.abs(daysUntilDue)}D`;
        title = `CRITICAL: Book Overdue by ${Math.abs(daysUntilDue)} Days`;
        message = `Overdue alert for "${book.title}" (${copy.copyNumber}). Late fine of ₹${Math.abs(daysUntilDue) * 10} currently accumulating.`;
      }

      if (scheduleKey) {
        // Prevent duplicate reminders using notification check
        const alreadyNotified = dbStore.notifications.some(n => 
          n.userId === user.id && 
          n.message.includes(copy.copyNumber) && 
          n.title === title
        );

        if (!alreadyNotified) {
          dbStore.notifications.unshift({
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            userId: user.id,
            title,
            message,
            type: daysUntilDue <= 0 ? 'OVERDUE' : 'DUE_REMINDER',
            link: '/portal/borrowed',
            isRead: false,
            createdAt: new Date().toISOString()
          });
          processedCount++;
        }
      }
    }

    if (processedCount > 0) {
      console.log(`[Reminder Cron] Processed and dispatched ${processedCount} due return reminders.`);
    }
  }
}

export const reminderService = ReminderService.getInstance();
