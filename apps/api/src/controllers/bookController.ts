import { Request, Response } from 'express';
import { bookService } from '../services/bookService';
import { AuthenticatedRequest } from '../middleware/auth';
import { dbStore } from '../services/store';

export class BookController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const { search, categoryId, availability } = req.query;
      const books = bookService.getAllBooks({
        search: search as string,
        categoryId: categoryId as string,
        availability: availability as string
      });

      return res.json({
        success: true,
        count: books.length,
        categories: dbStore.categories,
        books
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getById = async (req: Request, res: Response) => {
    try {
      const book = bookService.getBookById(req.params.id);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      return res.json({ success: true, book });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public create = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const book = bookService.createBook(req.body, adminId, adminName);
      return res.status(201).json({ success: true, message: 'Book created successfully', book });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public update = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const book = bookService.updateBook(req.params.id, req.body, adminId, adminName);
      return res.json({ success: true, message: 'Book updated successfully', book });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public delete = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const result = bookService.deleteBook(req.params.id, adminId, adminName);
      return res.json({ success: true, message: 'Book deleted successfully', result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public getCategories = async (req: Request, res: Response) => {
    return res.json({ success: true, categories: dbStore.categories });
  };
}

export const bookController = new BookController();
