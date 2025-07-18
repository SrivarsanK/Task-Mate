"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle2, AlertCircle, User, Mail, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<any[]>([])
  const [googleLoading, setGoogleLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkAuthState()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session)
      setSession(session)
      setUser(session?.user || null)

      // Add test result for auth state change
      addTestResult(`Auth State Change: ${event}`, event === "SIGNED_IN" ? "success" : "info", {
        event,
        user: session?.user?.email,
        provider: session?.user?.app_metadata?.provider,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuthState = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        addTestResult("Session Check Failed", "error", { error: error.message })
      } else {
        addTestResult("Session Check", session ? "success" : "info", {
          hasSession: !!session,
          user: session?.user?.email,
          provider: session?.user?.app_metadata?.provider,
        })
      }

      setSession(session)
      setUser(session?.user || null)
    } catch (error: any) {
      addTestResult("Session Check Error", "error", { error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const addTestResult = (test: string, status: "success" | "error" | "info", details: any) => {
    const result = {
      id: Date.now(),
      test,
      status,
      details,
      timestamp: new Date().toLocaleTimeString(),
    }
    setTestResults((prev) => [result, ...prev])
  }

  const testGoogleSignIn = async () => {
    setGoogleLoading(true)
    addTestResult("Google Sign-In Initiated", "info", { timestamp: new Date().toISOString() })

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        addTestResult("Google OAuth Error", "error", { error: error.message })
      } else {
        addTestResult("Google OAuth Redirect", "success", {
          redirected: true,
          url: data.url,
        })
      }
    } catch (error: any) {
      addTestResult("Google Sign-In Exception", "error", { error: error.message })
    } finally {
      setGoogleLoading(false)
    }
  }

  const testSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        addTestResult("Sign Out Failed", "error", { error: error.message })
      } else {
        addTestResult("Sign Out Success", "success", {})
      }
    } catch (error: any) {
      addTestResult("Sign Out Exception", "error", { error: error.message })
    }
  }

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      if (error) {
        addTestResult("Database Connection Failed", "error", { error: error.message })
      } else {
        addTestResult("Database Connection Success", "success", { connected: true })
      }
    } catch (error: any) {
      addTestResult("Database Connection Exception", "error", { error: error.message })
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4" />
      case "error":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">TaskMate Auth Test</span>
          </div>
          <p className="text-slate-400">Test and debug your Google OAuth integration</p>
          <Link href="/dashboard" className="text-teal-400 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Auth State */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Current Auth State
              </CardTitle>
              <CardDescription>Your current authentication status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-400">Checking auth state...</p>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Authenticated
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span>Provider: {user.app_metadata?.provider || "email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Signed in: {new Date(user.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={testSignOut}
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50 bg-transparent"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Not Authenticated</Badge>
                  <p className="text-slate-400 text-sm">No active session found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>Run authentication tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-teal-400 hover:bg-teal-500 text-slate-950 font-semibold"
              >
                {googleLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    Testing Google Sign-In...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Test Google Sign-In
                  </>
                )}
              </Button>

              <Button
                onClick={testSupabaseConnection}
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50 bg-transparent"
              >
                Test Database Connection
              </Button>

              <Button
                onClick={checkAuthState}
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50 bg-transparent"
              >
                Refresh Auth State
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Real-time authentication test logs</CardDescription>
              </div>
              <Button
                onClick={clearResults}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50 bg-transparent"
              >
                Clear Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No test results yet. Run some tests to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result) => (
                  <div key={result.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <Badge className={`${getStatusColor(result.status)} border flex-shrink-0`}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1">{result.status}</span>
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.test}</h4>
                        <span className="text-xs text-slate-400">{result.timestamp}</span>
                      </div>
                      {result.details && Object.keys(result.details).length > 0 && (
                        <pre className="text-xs text-slate-400 mt-1 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Configuration and environment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Environment</h4>
                <div className="space-y-1 text-slate-400">
                  <p>Origin: {typeof window !== "undefined" ? window.location.origin : "N/A"}</p>
                  <p>
                    Callback URL: {typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "N/A"}
                  </p>
                  <p>
                    User Agent: {typeof window !== "undefined" ? navigator.userAgent.substring(0, 50) + "..." : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supabase Config</h4>
                <div className="space-y-1 text-slate-400">
                  <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
                  <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
                  <p>Project: wmfsrhimusopcewriabk</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
