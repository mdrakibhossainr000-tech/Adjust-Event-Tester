-- KSG Event Tester Migration
-- Schema Analysis: Starting from scratch with auth and game event management
-- Integration Type: Complete backend setup with authentication
-- Dependencies: auth.users (Supabase built-in)

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'tester', 'viewer');
CREATE TYPE public.event_status AS ENUM ('active', 'inactive', 'testing');
CREATE TYPE public.event_category AS ENUM ('gameplay', 'achievement', 'social', 'wellness', 'special');

-- 2. Core Tables
-- User profiles table (critical intermediary for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'tester'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    app_token TEXT NOT NULL UNIQUE,
    description TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 0,
    status public.event_status DEFAULT 'active'::public.event_status,
    category public.event_category DEFAULT 'gameplay'::public.event_category,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Event logs table for tracking testing activities
CREATE TABLE public.event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    adid TEXT NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    event_ids UUID[] DEFAULT '{}',
    operation TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes for performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_games_created_by ON public.games(created_by);
CREATE INDEX idx_events_game_id ON public.events(game_id);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_event_logs_user_id ON public.event_logs(user_id);
CREATE INDEX idx_event_logs_game_id ON public.event_logs(game_id);
CREATE INDEX idx_event_logs_created_at ON public.event_logs(created_at);

-- 4. Functions (must be created before RLS policies)
-- Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'tester')::public.user_role
    );
    RETURN NEW;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (using safe patterns)
-- Pattern 1: Core user table - simple ownership only
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for games
CREATE POLICY "authenticated_users_view_games"
ON public.games
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_manage_own_games"
ON public.games
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Pattern 2: Simple user ownership for events
CREATE POLICY "authenticated_users_view_events"
ON public.events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_manage_own_events"
ON public.events
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Pattern 2: Simple user ownership for event logs
CREATE POLICY "users_manage_own_event_logs"
ON public.event_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_user_profiles_updated
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_games_updated
    BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_events_updated
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    tester_uuid UUID := gen_random_uuid();
    game1_id UUID := gen_random_uuid();
    game2_id UUID := gen_random_uuid();
    game3_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@ksgtest.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "KSG Admin", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (tester_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'tester@ksgtest.com', crypt('tester123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Event Tester", "role": "tester"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Insert sample games
    INSERT INTO public.games (id, name, app_token, description, created_by) VALUES
        (game1_id, 'Word Voyage', 'wv_token_2024', 'Adventure word puzzle game', admin_uuid),
        (game2_id, 'Zen Master', 'zm_token_2024', 'Mindfulness and meditation app', admin_uuid),
        (game3_id, 'Number Quest', 'nq_token_2024', 'Mathematical puzzle challenge', admin_uuid);

    -- Insert sample events for each game
    INSERT INTO public.events (game_id, name, description, credits, status, category, created_by) VALUES
        -- Word Voyage events
        (game1_id, 'Daily Login Bonus', 'Reward for daily login', 100, 'active', 'gameplay', admin_uuid),
        (game1_id, 'Level Complete', 'Complete any level', 150, 'active', 'achievement', admin_uuid),
        (game1_id, 'Word Master', 'Find all words in a puzzle', 300, 'active', 'achievement', admin_uuid),
        
        -- Zen Master events
        (game2_id, 'Meditation Complete', 'Complete daily meditation', 125, 'active', 'wellness', admin_uuid),
        (game2_id, 'Mindfulness Streak', '7-day mindfulness streak', 250, 'active', 'wellness', admin_uuid),
        
        -- Number Quest events
        (game3_id, 'Perfect Score', 'Achieve perfect score in level', 200, 'active', 'achievement', admin_uuid),
        (game3_id, 'Speed Solver', 'Complete level under time limit', 175, 'active', 'gameplay', admin_uuid);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;