import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Find profile by verification token
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email_verification_token", token)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 404 })
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Check if token has expired
    if (profile.email_verification_expires_at) {
      const expiresAt = new Date(profile.email_verification_expires_at)
      const now = new Date()

      if (now > expiresAt) {
        return NextResponse.json({ error: "Verification token has expired" }, { status: 400 })
      }
    }

    // Update profile to mark as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_sent_at: null,
        email_verification_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
    }

    // Log successful verification
    await supabase
      .from("email_verification_logs")
      .update({ verified_at: new Date().toISOString() })
      .eq("user_id", profile.id)
      .eq("verification_token", token)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
      },
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
