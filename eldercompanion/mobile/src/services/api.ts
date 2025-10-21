import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  AuthResponse,
  Conversation,
  OpenAITokenResponse,
} from '../types';

// Get API base URL from environment or use default
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: '@eldercompanion:auth_token',
  USER: '@eldercompanion:user',
};

/**
 * Get stored auth token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Store auth token
 */
export async function setAuthToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
}

/**
 * Get stored user
 */
export async function getStoredUser(): Promise<User | null> {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
}

/**
 * Store user
 */
export async function setStoredUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
}

/**
 * Clear authentication data
 */
export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER]);
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
}

/**
 * Make authenticated API request
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear auth data
  if (response.status === 401) {
    await clearAuth();
  }

  return response;
}

/**
 * Sign up a new user
 */
export async function signup(
  email: string,
  password: string,
  role: 'parent' | 'child',
  fullName: string,
  phone?: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      role,
      full_name: fullName,
      phone,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }

  const data: AuthResponse = await response.json();

  // Store auth data
  await setAuthToken(data.token);
  await setStoredUser(data.user);

  return data;
}

/**
 * Log in a user
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();

  // Store auth data
  await setAuthToken(data.token);
  await setStoredUser(data.user);

  return data;
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  await clearAuth();
}

/**
 * Get ephemeral OpenAI token
 */
export async function getOpenAIToken(): Promise<OpenAITokenResponse> {
  const response = await authenticatedFetch('/api/openai/token', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get OpenAI token');
  }

  return response.json();
}

/**
 * Get conversations for a user
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  const response = await authenticatedFetch(`/api/conversations/${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get conversations');
  }

  return response.json();
}

/**
 * Create a new conversation
 */
export async function createConversation(): Promise<Conversation> {
  const response = await authenticatedFetch('/api/conversations', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create conversation');
  }

  return response.json();
}

/**
 * Update a conversation
 */
export async function updateConversation(
  conversationId: string,
  updates: Partial<Conversation>
): Promise<Conversation> {
  const response = await authenticatedFetch(`/api/conversations/${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update conversation');
  }

  return response.json();
}

/**
 * Check API health
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
