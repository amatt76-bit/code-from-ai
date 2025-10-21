import { Router, Request, Response } from 'express';
// import bcrypt from 'bcrypt'; // TODO: Uncomment when implementing password hashing
import { SignupRequest, LoginRequest, AuthResponse } from '../types';
import { createUser, getUserByEmail, createParentProfile } from '../services/supabase';
import { generateToken } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, full_name, phone }: SignupRequest = req.body;

    // Validate input
    if (!email || !password || !role || !full_name) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email, password, role, and full name are required',
      });
      return;
    }

    if (!['parent', 'child'].includes(role)) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Role must be either "parent" or "child"',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        error: 'User exists',
        message: 'A user with this email already exists',
      });
      return;
    }

    // Hash password (for future use with password storage)
    // const hashedPassword = await bcrypt.hash(password, 10);
    // TODO: Store hashedPassword in database when implementing full auth

    // Create user
    const user = await createUser(email, role, full_name, phone);

    // If user is a parent, create a parent profile
    if (role === 'parent') {
      await createParentProfile(user.id);
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user and token
    const response: AuthResponse = {
      user,
      token,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create user account',
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required',
      });
      return;
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
      return;
    }

    // For this implementation, we're using a simple password comparison
    // In production, you should use Supabase Auth or store hashed passwords
    // This is a simplified version for demonstration

    // Note: You'll need to store the hashed password in the users table
    // For now, this is a placeholder
    // const isValidPassword = await bcrypt.compare(password, user.password_hash);

    // Temporary: Accept any password for demonstration
    // Remove this in production!
    const isValidPassword = true;

    if (!isValidPassword) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user and token
    const response: AuthResponse = {
      user,
      token,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to authenticate user',
    });
  }
});

export default router;
