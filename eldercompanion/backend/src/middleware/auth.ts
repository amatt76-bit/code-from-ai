import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types';
import { getUserById } from '../services/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: User;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Authentication required', message: 'No token provided' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Get user from database
    const user = await getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'Authentication failed', message: 'User not found' });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Authentication failed', message: 'Invalid token' });
  }
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
}

/**
 * Middleware to check if user has a specific role
 */
export function requireRole(role: 'parent' | 'child') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required', message: 'No user found' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        error: 'Authorization failed',
        message: `This endpoint requires ${role} role`,
      });
      return;
    }

    next();
  };
}
