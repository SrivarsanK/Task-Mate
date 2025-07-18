import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Check if verification was sent recently (rate limiting)
    if (profile.email_verification_sent_at) {
      const lastSent = new Date(profile.email_verification_sent_at)
      const now = new Date()
      const timeDiff = now.getTime() - lastSent.getTime()
      const minutesDiff = timeDiff / (1000 * 60)

      if (minutesDiff < 2) {
        return NextResponse.json(
          { error: "Please wait 2 minutes before requesting another verification email" },
          { status: 429 },
        )
      }
    }

    // Generate new verification token
    const verificationToken = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update profile with new token
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verification_token: verificationToken,
        email_verification_sent_at: new Date().toISOString(),
        email_verification_expires_at: expiresAt.toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update verification token" }, { status: 500 })
    }

    // Get client info for logging
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Log verification attempt
    await supabase.from("email_verification_logs").insert([
      {
        user_id: user.id,
        email: user.email,
        verification_token: verificationToken,
        ip_address: clientIP,
        user_agent: userAgent,
      },
    ])

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

    const emailHtml = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: white; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2dd4bf, #0891b2); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Welcome to TaskMate!</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #2dd4bf; margin-bottom: 16px;">Verify Your Email Address</h2>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hi ${profile.full_name || user.email}! 👋
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Thanks for signing up with TaskMate! To complete your registration and start boosting your productivity, 
            please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" 
               style="background: #2dd4bf; color: #0f172a; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px; color: #94a3b8;">
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; word-break: break-all; background: #1e293b; padding: 12px; border-radius: 6px; color: #cbd5e1;">
            ${verificationUrl}
          </p>
          <p style="font-size: 14px; line-height: 1.6; margin-top: 24px; color: #94a3b8;">
            This verification link will expire in 24 hours. If you didn't create a TaskMate account, 
            you can safely ignore this email.
          </p>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              Best regards,<br>
              The TaskMate Team
            </p>
          </div>
        </div>
      </div>
    `

    await resend.emails.send({
      from: "TaskMate <noreply@taskmate.app>",
      to: [user.email!],
      subject: "Verify your TaskMate account",
      html: emailHtml,
    })

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
  }
}
