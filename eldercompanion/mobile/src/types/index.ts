export interface User {
  id: string;
  email: string;
  role: 'parent' | 'child';
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  transcript?: ConversationMessage[];
  summary?: string;
  sentiment?: string;
  topics_discussed: string[];
  activities_mentioned: string[];
}

export interface OpenAITokenResponse {
  token: string;
  expiresAt: number;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
}

export interface RealtimeEvent {
  type: string;
  event: any;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

export type NavigationParamList = {
  ParentHome: undefined;
  VoiceChat: {
    userId: string;
  };
};
