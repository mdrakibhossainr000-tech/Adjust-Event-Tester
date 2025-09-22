import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, authHelpers, dbHelpers } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Separate async operations to avoid breaking Supabase auth callbacks
  const profileOperations = {
    async load(userId) {
      if (!userId) return;
      setProfileLoading(true);
      try {
        const { data, error } = await dbHelpers?.getUserProfile();
        if (!error && data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Profile load error:', error);
      } finally {
        setProfileLoading(false);
      }
    },

    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    }
  };

  // Protected auth handlers - MUST remain synchronous
  const authStateHandlers = {
    onChange: (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        // Fire-and-forget async operation
        profileOperations?.load(session?.user?.id);
      } else {
        profileOperations?.clear();
      }
    }
  };

  useEffect(() => {
    // Get initial session
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session);
    });

    // Listen for auth changes - CRITICAL: callback must be synchronous
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Auth methods
  const signIn = async (email, password) => {
    const { data, error } = await authHelpers?.signIn(email, password);
    return { data, error };
  };

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await authHelpers?.signUp(email, password, userData);
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await authHelpers?.signOut();
    return { error };
  };

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile: () => profileOperations?.load(user?.id)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};