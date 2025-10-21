import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  getConversationsByUserId,
  saveConversation,
  updateConversation,
} from '../services/supabase';
import { Conversation, ConversationMessage } from '../types';
import {
  generateConversationSummary,
  analyzeConversationSentiment,
} from '../services/openai-service';

const router = Router();

/**
 * GET /api/conversations/:userId
 * Get all conversations for a specific user
 * Requires authentication
 */
router.get('/:userId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated',
      });
      return;
    }

    // Check authorization: user can only view their own conversations
    // or children can view their parent's conversations
    if (req.user.id !== userId && req.user.role !== 'child') {
      res.status(403).json({
        error: 'Authorization failed',
        message: 'You do not have permission to view these conversations',
      });
      return;
    }

    const conversations = await getConversationsByUserId(userId);

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve conversations',
    });
  }
});

/**
 * POST /api/conversations
 * Create a new conversation
 * Requires authentication
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated',
      });
      return;
    }

    const conversationData: Partial<Conversation> = {
      user_id: req.user.id,
      started_at: new Date().toISOString(),
      transcript: [],
      topics_discussed: [],
      activities_mentioned: [],
    };

    const conversation = await saveConversation(conversationData);

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create conversation',
    });
  }
});

/**
 * PATCH /api/conversations/:conversationId
 * Update a conversation (e.g., add transcript, mark as ended)
 * Requires authentication
 */
router.patch(
  '/:conversationId',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const updates = req.body;

      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated',
        });
        return;
      }

      // If ending a conversation, generate summary and sentiment
      if (updates.ended_at && updates.transcript) {
        try {
          const summary = await generateConversationSummary(updates.transcript);
          const sentiment = await analyzeConversationSentiment(updates.transcript);

          updates.summary = summary;
          updates.sentiment = sentiment.toLowerCase().trim();
        } catch (error) {
          console.error('Error generating summary/sentiment:', error);
          // Continue without summary if it fails
        }
      }

      const conversation = await updateConversation(conversationId, updates);

      res.status(200).json(conversation);
    } catch (error) {
      console.error('Error updating conversation:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'Failed to update conversation',
      });
    }
  }
);

export default router;
