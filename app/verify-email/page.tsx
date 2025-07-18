"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Target, AlertCircle, Mail, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setLoading(false)
      setError("No verification token provided")
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerified(true)
      } else {
        setError(data.error || "Failed to verify email")
      }
    } catch (error) {
      setError("Network error occurred")
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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">TaskMate</span>
          </div>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <CardHeader className="text-center">
            {loading ? (
              <>
                <div className="w-12 h-12 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <CardTitle>Verifying Your Email...</CardTitle>
                <CardDescription className="text-slate-400">
                  Please wait while we verify your email address
                </CardDescription>
              </>
            ) : verified ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-green-400">Email Verified!</CardTitle>
                <CardDescription className="text-slate-400">Your email has been successfully verified</CardDescription>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-red-400">Verification Failed</CardTitle>
                <CardDescription className="text-slate-400">{error}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {verified ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-400 text-sm text-center">
                    🎉 Welcome to TaskMate! Your account is now fully activated and ready to use.
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full bg-teal-400 hover:bg-teal-500 text-slate-950 font-semibold">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              !loading && (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="w-5 h-5 text-teal-400" />
                      <h3 className="font-semibold">Need a new verification link?</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      If your verification link has expired or you need a new one, click the button below to resend it.
                    </p>
                    <Button
                      onClick={resendVerification}
                      disabled={resendLoading}
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50 bg-transparent"
                    >
                      {resendLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>
                    {resendMessage && (
                      <p
                        className={`text-sm mt-3 text-center ${
                          resendMessage.includes("sent") ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {resendMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <Link href="/">
                      <Button variant="ghost" className="text-slate-400 hover:text-white">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
