import { Request, Response } from 'express';
import { dbStore } from '../services/store';

export class ReportController {
  public getStats = async (req: Request, res: Response) => {
    try {
      const stats = dbStore.getStats();
      const recentActivities = dbStore.activityLogs.slice(0, 10);
      return res.json({
        success: true,
        stats,
        recentActivities
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getInventoryReport = async (req: Request, res: Response) => {
    try {
      const report = dbStore.books.map(b => ({
        isbn: b.isbn,
        title: b.title,
        author: b.author,
        category: b.category?.name,
        rackLocation: b.rackLocation,
        totalCopies: b.totalCopies,
        availableCopies: b.availableCopies,
        reservedCopies: b.reservedCopies,
        borrowedCopies: b.borrowedCopies
      }));

      return res.json({ success: true, count: report.length, report });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getBorrowingReport = async (req: Request, res: Response) => {
    try {
      const report = dbStore.transactions.map(t => {
        const copy = dbStore.copies.find(c => c.id === t.copyId);
        const book = copy ? dbStore.books.find(b => b.id === copy.bookId) : undefined;
        const user = dbStore.profiles.find(p => p.id === t.userId);
        return {
          transactionId: t.id,
          copyNumber: copy?.copyNumber,
          bookTitle: book?.title,
          borrowerName: user?.name,
          borrowerRole: user?.role,
          borrowerId: user?.rollNumber || user?.staffId,
          issueDate: t.issueDate,
          dueDate: t.dueDate,
          returnDate: t.returnDate,
          status: t.status
        };
      });

      return res.json({ success: true, count: report.length, report });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getOverdueReport = async (req: Request, res: Response) => {
    try {
      const overdues = dbStore.transactions.filter(t => t.status === 'OVERDUE').map(t => {
        const copy = dbStore.copies.find(c => c.id === t.copyId);
        const book = copy ? dbStore.books.find(b => b.id === copy.bookId) : undefined;
        const user = dbStore.profiles.find(p => p.id === t.userId);
        const fine = dbStore.fines.find(f => f.transactionId === t.id);

        return {
          transactionId: t.id,
          copyNumber: copy?.copyNumber,
          bookTitle: book?.title,
          borrowerName: user?.name,
          borrowerEmail: user?.email,
          borrowerId: user?.rollNumber || user?.staffId,
          dueDate: t.dueDate,
          overdueDays: fine?.overdueDays || 0,
          fineAmount: fine?.amount || 0,
          fineStatus: fine?.status || 'UNPAID'
        };
      });

      return res.json({ success: true, count: overdues.length, overdues });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
}

export const reportController = new ReportController();
