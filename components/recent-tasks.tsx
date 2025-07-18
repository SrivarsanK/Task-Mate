"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle, MoreHorizontal, Users, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description: string
  deadline: string
  status: "pending" | "in_progress" | "completed" | "overdue"
  partner_email?: string
  created_at: string
}

export default function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchRecentTasks()
  }, [])

  const fetchRecentTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6)

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching recent tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId)

      if (error) throw error

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)))
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "overdue":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "overdue":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Your latest task activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Your latest task activity</CardDescription>
        </div>
        <Link href="/dashboard/tasks">
          <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Circle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No tasks yet</p>
            <p className="text-sm text-slate-500">Create your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{task.title}</h4>
                    <Badge className={`${getStatusColor(task.status)} border text-xs`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize">{task.status.replace("_", " ")}</span>
                    </Badge>
                  </div>
                  {task.description && <p className="text-sm text-slate-400 mb-2 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.deadline)}</span>
                    </div>
                    {task.partner_email && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Partner</span>
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem
                      onClick={() => updateTaskStatus(task.id, "completed")}
                      className="text-slate-300 hover:bg-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateTaskStatus(task.id, "in_progress")}
                      className="text-slate-300 hover:bg-slate-800"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      In Progress
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
