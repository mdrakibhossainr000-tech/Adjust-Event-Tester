import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const authHelpers = {
  async signIn(email, password) {
    const { data, error } = await supabase?.auth?.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase?.auth?.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase?.auth?.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase?.auth?.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await supabase?.auth?.getSession();
    return session;
  }
};

// Database helper functions
export const dbHelpers = {
  // Games
  async getGames() {
    const { data, error } = await supabase?.from('games')?.select('*')?.order('created_at', { ascending: false });
    return { data, error };
  },

  async createGame(gameData) {
    const user = await authHelpers?.getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    const { data, error } = await supabase?.from('games')?.insert({
        ...gameData,
        created_by: user?.id
      })?.select()?.single();
    return { data, error };
  },

  async updateGame(id, gameData) {
    const { data, error } = await supabase?.from('games')?.update(gameData)?.eq('id', id)?.select()?.single();
    return { data, error };
  },

  async deleteGame(id) {
    const { error } = await supabase?.from('games')?.delete()?.eq('id', id);
    return { error };
  },

  // Events
  async getEventsByGameId(gameId) {
    const { data, error } = await supabase?.from('events')?.select('*')?.eq('game_id', gameId)?.order('created_at', { ascending: false });
    return { data, error };
  },

  async createEvent(eventData) {
    const user = await authHelpers?.getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    const { data, error } = await supabase?.from('events')?.insert({
        ...eventData,
        created_by: user?.id
      })?.select()?.single();
    return { data, error };
  },

  async updateEvent(id, eventData) {
    const { data, error } = await supabase?.from('events')?.update(eventData)?.eq('id', id)?.select()?.single();
    return { data, error };
  },

  async deleteEvents(eventIds) {
    const { error } = await supabase?.from('events')?.delete()?.in('id', eventIds);
    return { error };
  },

  // Event Logs
  async createEventLog(logData) {
    const user = await authHelpers?.getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    const { data, error } = await supabase?.from('event_logs')?.insert({
        ...logData,
        user_id: user?.id
      })?.select()?.single();
    return { data, error };
  },

  async getUserEventLogs(limit = 50) {
    const user = await authHelpers?.getCurrentUser();
    if (!user) throw new Error('User must be authenticated');

    const { data, error } = await supabase?.from('event_logs')?.select(`
        *,
        game:games(name)
      `)?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(limit);
    return { data, error };
  },

  // User Profile
  async getUserProfile() {
    const user = await authHelpers?.getCurrentUser();
    if (!user) return { data: null, error: null };

    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', user?.id)?.single();
    return { data, error };
  }
};

export default supabase;