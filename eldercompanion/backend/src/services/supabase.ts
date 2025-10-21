import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Conversation, Activity } from '../types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Missing Supabase environment variables. Database operations will fail.');
  console.warn('   Please configure SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

/**
 * Create a new user in the database
 */
export async function createUser(
  email: string,
  role: 'parent' | 'child',
  fullName: string,
  phone?: string
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      role,
      full_name: fullName,
      phone,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error getting user by email:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return data;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error getting user by ID:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return data;
}

/**
 * Create a parent profile
 */
export async function createParentProfile(userId: string) {
  const { data, error } = await supabase
    .from('parent_profiles')
    .insert({
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating parent profile:', error);
    throw new Error(`Failed to create parent profile: ${error.message}`);
  }

  return data;
}

/**
 * Save a conversation to the database
 */
export async function saveConversation(conversation: Partial<Conversation>): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert(conversation)
    .select()
    .single();

  if (error) {
    console.error('Error saving conversation:', error);
    throw new Error(`Failed to save conversation: ${error.message}`);
  }

  return data;
}

/**
 * Update a conversation
 */
export async function updateConversation(
  conversationId: string,
  updates: Partial<Conversation>
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating conversation:', error);
    throw new Error(`Failed to update conversation: ${error.message}`);
  }

  return data;
}

/**
 * Get conversations for a user
 */
export async function getConversationsByUserId(
  userId: string,
  limit: number = 50
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error getting conversations:', error);
    throw new Error(`Failed to get conversations: ${error.message}`);
  }

  return data || [];
}

/**
 * Create an activity
 */
export async function createActivity(activity: Partial<Activity>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single();

  if (error) {
    console.error('Error creating activity:', error);
    throw new Error(`Failed to create activity: ${error.message}`);
  }

  return data;
}

/**
 * Get activities for a user
 */
export async function getActivitiesByUserId(
  userId: string,
  limit: number = 50
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error getting activities:', error);
    throw new Error(`Failed to get activities: ${error.message}`);
  }

  return data || [];
}
