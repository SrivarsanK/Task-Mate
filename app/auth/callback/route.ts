import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wmfsrhimusopcewriabk.supabase.co",
        supabaseKey:
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZnNyaGltdXNvcGNld3JpYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjQ0NTIsImV4cCI6MjA2ODQwMDQ1Mn0.oAU3Ba39guUROYWxhAt_RBIgZDoWzz9IXnKWccYHXnE",
      },
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
