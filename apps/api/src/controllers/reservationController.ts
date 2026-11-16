import { Response } from 'express';
import { reservationService } from '../services/reservationService';
import { AuthenticatedRequest } from '../middleware/auth';

export class ReservationController {
  public getAll = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.query.status as string;
      const reservations = reservationService.getAllReservations(status);
      return res.json({ success: true, count: reservations.length, reservations });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getMy = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'usr-student-1';
      const reservations = reservationService.getMyReservations(userId);
      return res.json({ success: true, count: reservations.length, reservations });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public request = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'usr-student-1';
      const { copyId, durationHours } = req.body;
      const reservation = reservationService.requestReservation(copyId, userId, durationHours);
      return res.status(201).json({ success: true, message: 'Reservation request submitted', reservation });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public approve = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const reservation = reservationService.approveReservation(req.params.id, adminId, adminName);
      return res.json({ success: true, message: 'Reservation approved', reservation });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public reject = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const { reason } = req.body;
      const reservation = reservationService.rejectReservation(req.params.id, reason, adminId, adminName);
      return res.json({ success: true, message: 'Reservation rejected', reservation });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };

  public cancel = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'usr-student-1';
      const reservation = reservationService.cancelReservation(req.params.id, userId);
      return res.json({ success: true, message: 'Reservation cancelled successfully', reservation });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };
}

export const reservationController = new ReservationController();
