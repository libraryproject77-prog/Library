import { Response } from 'express';
import { memberService } from '../services/memberService';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '@library/shared';

export class MemberController {
  public getAll = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { role, search } = req.query;
      const members = memberService.getAllMembers(role as UserRole, search as string);
      return res.json({ success: true, count: members.length, members });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const member = memberService.getMemberById(req.params.id);
      if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }
      return res.json({ success: true, member });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  public toggleStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const adminId = req.user?.id || 'admin';
      const adminName = req.user?.name || 'Administrator';
      const updated = memberService.toggleAccountStatus(req.params.id, adminId, adminName);
      return res.json({ success: true, message: `Account status updated to ${updated.status}`, member: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  };
}

export const memberController = new MemberController();
