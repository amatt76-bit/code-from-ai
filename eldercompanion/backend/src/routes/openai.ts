import { Router, Request, Response } from 'express';
import { generateEphemeralToken } from '../services/openai-service';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/openai/token
 * Generate an ephemeral token for OpenAI Realtime API
 * Requires authentication
 */
router.post('/token', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated',
      });
      return;
    }

    // Generate ephemeral token
    const tokenResponse = await generateEphemeralToken();

    res.status(200).json(tokenResponse);
  } catch (error) {
    console.error('Error generating OpenAI token:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to generate OpenAI token',
    });
  }
});

/**
 * GET /api/openai/status
 * Check if OpenAI API is configured correctly
 */
router.get('/status', async (_req: Request, res: Response): Promise<void> => {
  try {
    const isConfigured = !!process.env.OPENAI_API_KEY;

    res.status(200).json({
      configured: isConfigured,
      message: isConfigured
        ? 'OpenAI API is configured'
        : 'OpenAI API key is missing',
    });
  } catch (error) {
    console.error('Error checking OpenAI status:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to check OpenAI status',
    });
  }
});

export default router;
