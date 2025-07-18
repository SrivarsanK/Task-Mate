-- Add email verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for verification token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON public.profiles(email_verification_token);

-- Create email_verification_logs table to track verification attempts
CREATE TABLE IF NOT EXISTS public.email_verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    verification_token TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT
);

-- Enable RLS on email_verification_logs
ALTER TABLE public.email_verification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for email_verification_logs
CREATE POLICY "Users can view own verification logs" ON public.email_verification_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert verification logs" ON public.email_verification_logs
    FOR INSERT WITH CHECK (true);

-- Create function to generate verification token
CREATE OR REPLACE FUNCTION public.generate_verification_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to require email verification for OAuth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    verification_token TEXT;
    requires_verification BOOLEAN := FALSE;
BEGIN
    -- Check if user signed up via OAuth (Google, etc.)
    IF NEW.app_metadata->>'provider' != 'email' THEN
        requires_verification := TRUE;
        verification_token := public.generate_verification_token();
    END IF;

    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        email_verified,
        email_verification_token,
        email_verification_sent_at,
        email_verification_expires_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NOT requires_verification, -- Email users are verified through Supabase, OAuth users need manual verification
        CASE WHEN requires_verification THEN verification_token ELSE NULL END,
        CASE WHEN requires_verification THEN NOW() ELSE NULL END,
        CASE WHEN requires_verification THEN NOW() + INTERVAL '24 hours' ELSE NULL END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
