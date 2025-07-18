"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Mail, X, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function EmailVerificationBanner() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const supabase = createClient()

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUser(user)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(profile)
    } catch (error) {
      console.error("Error checking verification status:", error)
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    setResendLoading(true)
    setResendMessage("")

    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage("Verification email sent! Please check your inbox.")
      } else {
        setResendMessage(data.error || "Failed to send verification email")
      }
    } catch (error) {
      setResendMessage("Network error occurred")
    } finally {
      setResendLoading(false)
    }
  }

  // Don't show banner if loading, dismissed, or email is already verified
  if (loading || dismissed || !profile || profile.email_verified) {
    return null
  }

  // Only show for OAuth users (Google, etc.) who need email verification
  if (user?.app_metadata?.provider === "email") {
    return null
  }

  return (
    <Card className="bg-amber-500/10 border-amber-500/20 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-400 mb-1">Email Verification Required</h3>
            <p className="text-sm text-amber-200/80 mb-3">
              Please verify your email address ({user?.email}) to secure your account and enable all features.
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={resendVerification}
                disabled={resendLoading}
                size="sm"
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-semibold"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Verification Email
                  </>
                )}
              </Button>
              {resendMessage && (
                <p className={`text-xs ${resendMessage.includes("sent") ? "text-green-400" : "text-red-400"}`}>
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={() => setDismissed(true)}
            variant="ghost"
            size="icon"
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
