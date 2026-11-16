import { Request, Response } from 'express';
import { bookService } from '../services/bookService';
import { dbStore } from '../services/store';

export class CopyController {
  public getCopiesByBookId = async (req: Request, res: Response) => {
    try {
      const copies = dbStore.copies.filter(c => c.bookId === req.params.bookId);
      return res.json({ success: true, count: copies.length, copies });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public addCopy = async (req: Request, res: Response) => {
    try {
      const { bookId, copyNumber, conditionNotes } = req.body;
      const copy = bookService.addCopy(bookId, copyNumber, conditionNotes);
      return res.status(201).json({ success: true, message: 'Copy added', copy });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public updateStatus = async (req: Request, res: Response) => {
    try {
      const { status, conditionNotes } = req.body;
      const copy = bookService.updateCopyStatus(req.params.id, status, conditionNotes);
      return res.json({ success: true, message: 'Copy status updated', copy });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };
}

export const copyController = new CopyController();
