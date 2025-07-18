import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Grab credentials from env (fallbacks keep local preview working)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wmfsrhimusopcewriabk.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZnNyaGltdXNvcGNld3JpYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjQ0NTIsImV4cCI6MjA2ODQwMDQ1Mn0.oAU3Ba39guUROYWxhAt_RBIgZDoWzz9IXnKWccYHXnE"

// Client-side instance
export const createClient = () =>
  createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
