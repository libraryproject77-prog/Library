import { Response } from 'express';
import { dbStore } from '../services/store';
import { AuthenticatedRequest } from '../middleware/auth';

export class NotificationController {
  public getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'usr-admin-1';
      const userRole = req.user?.role || (userId.includes('admin') ? 'ADMIN' : 'STUDENT');
      
      const notifications = dbStore.notifications.filter(n => {
        if (n.userId === userId) return true;
        if (n.type === 'ANNOUNCEMENT') return true;
        if (userRole === 'ADMIN' && (n.targetRole === 'ADMIN' || n.type === 'RESERVATION' || n.userId === 'usr-admin-1')) {
          return true;
        }
        return false;
      });

      return res.json({ success: true, count: notifications.length, notifications });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public markAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const notif = dbStore.notifications.find(n => n.id === req.params.id);
      if (notif) {
        notif.isRead = true;
      }
      return res.json({ success: true, message: 'Notification marked as read' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getAnnouncements = async (req: AuthenticatedRequest, res: Response) => {
    return res.json({ success: true, announcements: dbStore.announcements });
  };

  public createAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const { title, content, priority } = req.body;

      const ann = {
        id: `ann-${Date.now()}`,
        title,
        content,
        authorId: adminId,
        authorName: adminName,
        priority: priority || 'NORMAL',
        createdAt: new Date().toISOString()
      };

      dbStore.announcements.unshift(ann);

      // Create broadcast notification for all users
      dbStore.profiles.forEach(p => {
        dbStore.notifications.unshift({
          id: `notif-ann-${Date.now()}-${p.id}`,
          userId: p.id,
          title: `Announcement: ${title}`,
          message: content,
          type: 'ANNOUNCEMENT',
          link: p.role === 'ADMIN' ? '/admin/notifications' : '/portal/notifications',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });

      return res.status(201).json({ success: true, message: 'Announcement published', announcement: ann });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };
}

export const notificationController = new NotificationController();
