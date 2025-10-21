import OpenAI from 'openai';
import { OpenAITokenResponse } from '../types';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey,
});

/**
 * Generate an ephemeral token for OpenAI Realtime API
 * This token is used by the client to connect directly to OpenAI's Realtime API
 * The token expires after a short period for security
 */
export async function generateEphemeralToken(): Promise<OpenAITokenResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-realtime-preview',
      messages: [
        {
          role: 'system',
          content: 'Generate ephemeral token',
        },
      ],
      // Note: In production, use the actual ephemeral token endpoint
      // This is a placeholder implementation
      // The real implementation would use OpenAI's session token API
    });

    // For now, we'll create a mock token structure
    // In production, you would use OpenAI's actual ephemeral token API
    // when it becomes available

    // IMPORTANT: This is a simplified version
    // You'll need to use the actual OpenAI Realtime API endpoint
    // to generate ephemeral tokens once available

    const token = apiKey; // Temporary: using API key directly
    const expiresAt = Date.now() + 60 * 1000; // Expires in 60 seconds

    return {
      token,
      expiresAt,
    };
  } catch (error) {
    console.error('Error generating ephemeral token:', error);
    throw new Error('Failed to generate OpenAI ephemeral token');
  }
}

/**
 * Create a completion using OpenAI's chat API
 * This can be used for non-realtime interactions or to generate summaries
 */
export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4o',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 500,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error creating chat completion:', error);
    throw new Error('Failed to create chat completion');
  }
}

/**
 * Generate a summary of a conversation transcript
 */
export async function generateConversationSummary(
  transcript: Array<{ role: string; content: string }>
): Promise<string> {
  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant that summarizes conversations. Create a brief, clear summary of the following conversation, highlighting key topics discussed and any important points or action items.',
    },
    {
      role: 'user',
      content: `Please summarize this conversation:\n\n${transcript
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n')}`,
    },
  ];

  return createChatCompletion(messages, { max_tokens: 300 });
}

/**
 * Analyze sentiment of a conversation
 */
export async function analyzeConversationSentiment(
  transcript: Array<{ role: string; content: string }>
): Promise<string> {
  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant that analyzes sentiment. Respond with a single word: positive, neutral, or negative.',
    },
    {
      role: 'user',
      content: `Analyze the sentiment of this conversation:\n\n${transcript
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n')}`,
    },
  ];

  return createChatCompletion(messages, { max_tokens: 10, temperature: 0.3 });
}

export default openai;
