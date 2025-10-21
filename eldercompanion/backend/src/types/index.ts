export interface User {
  id: string;
  email: string;
  role: 'parent' | 'child';
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  hobbies: string[];
  preferred_time?: string;
  mobility_level?: string;
  dietary_preferences: string[];
  favorite_topics: string[];
  social_preference?: string;
  tech_comfort?: string;
  voice_personality: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
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

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  activity_type?: string;
  scheduled_for?: string;
  completed_at?: string;
  completion_status: 'pending' | 'completed' | 'cancelled';
  created_by?: string;
  notes?: string;
  created_at: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: 'parent' | 'child';
  full_name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OpenAITokenResponse {
  token: string;
  expiresAt: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
