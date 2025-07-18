"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Target, AlertCircle } from "lucide-react"
import Link from "next/link"

interface ConfirmPageProps {
  params: {
    token: string
  }
}

export default function ConfirmPage({ params }: ConfirmPageProps) {
  const [loading, setLoading] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState("")
  const [task, setTask] = useState<any>(null)

  useEffect(() => {
    confirmTask()
  }, [])

  const confirmTask = async () => {
    try {
      const response = await fetch("/api/confirm-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: params.token }),
      })

      const data = await response.json()

      if (response.ok) {
        setConfirmed(true)
        setTask(data.task)
      } else {
        setError(data.error || "Failed to confirm task")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
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
                <CardTitle>Confirming Task...</CardTitle>
                <CardDescription className="text-slate-400">
                  Please wait while we process your confirmation
                </CardDescription>
              </>
            ) : confirmed ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-green-400">Task Confirmed!</CardTitle>
                <CardDescription className="text-slate-400">
                  Thank you for confirming the task completion
                </CardDescription>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-red-400">Confirmation Failed</CardTitle>
                <CardDescription className="text-slate-400">{error}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {confirmed && task && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Task Details:</h3>
                <p className="text-slate-300">{task.title}</p>
                <p className="text-sm text-slate-400 mt-2">
                  Completed by: {task.profiles?.full_name || task.profiles?.email}
                </p>
              </div>
            )}

            <div className="text-center">
              <Link href="/">
                <Button className="bg-teal-400 hover:bg-teal-500 text-slate-950 font-semibold">
                  Learn More About TaskMate
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
