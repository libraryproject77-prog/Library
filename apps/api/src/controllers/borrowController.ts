import { Response } from 'express';
import { borrowService } from '../services/borrowService';
import { AuthenticatedRequest } from '../middleware/auth';

export class BorrowController {
  public getAll = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.query.status as string;
      const transactions = borrowService.getAllTransactions(status);
      return res.json({ success: true, count: transactions.length, transactions });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getMy = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'usr-student-1';
      const transactions = borrowService.getMyBorrowings(userId);
      return res.json({ success: true, count: transactions.length, transactions });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public issue = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const { copyId, userId, days } = req.body;
      const tx = borrowService.issueBook(copyId, userId, days || 15, adminId, adminName);
      return res.status(201).json({ success: true, message: 'Book copy issued successfully', transaction: tx });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public return = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const { condition, waiveFine } = req.body;
      const tx = borrowService.returnBook(req.params.id, condition || 'GOOD', waiveFine || false, adminId, adminName);
      return res.json({ success: true, message: 'Book returned successfully', transaction: tx });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };
}

export const borrowController = new BorrowController();
