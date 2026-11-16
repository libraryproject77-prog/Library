import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { dbStore } from '../services/store';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  // Direct login or Google OAuth callback handler
  public login = async (req: Request, res: Response) => {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    // Verify college email domain
    const domain = email.split('@')[1];
    if (domain !== config.collegeEmailDomain) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized email domain. Only @${config.collegeEmailDomain} addresses are allowed.`
      });
    }

    let user = dbStore.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Auto-register college user if valid domain
      const emailLower = email.toLowerCase();
      const isStudent = role === 'STUDENT' || emailLower.includes('.ug.') || emailLower.includes('.pg.');
      const isStaff = role === 'STAFF' || (!isStudent && !emailLower.includes('admin'));
      const newRole = emailLower.includes('admin') ? 'ADMIN' : (isStaff ? 'STAFF' : 'STUDENT');

      const prefix = email.split('@')[0];
      const namePart = prefix.split('.')[0];
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();

      user = {
        id: `usr-${Date.now()}`,
        email: emailLower,
        name: formattedName || prefix.toUpperCase(),
        role: newRole,
        department: 'ECE',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbStore.profiles.push(user);
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000
    });

    return res.json({
      success: true,
      token,
      user
    });
  };

  public getMe = async (req: AuthenticatedRequest, res: Response) => {
    return res.json({
      success: true,
      user: req.user
    });
  };

  public logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully' });
  };
}

export const authController = new AuthController();
