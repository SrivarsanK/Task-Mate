"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Clock, CheckCircle2, Circle, AlertCircle, Users, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import EmailVerificationBanner from "@/components/email-verification-banner"
import DashboardStats from "@/components/dashboard-stats"
import RecentTasks from "@/components/recent-tasks"
import ActivityFeed from "@/components/activity-feed"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description: string
  deadline: string
  status: "pending" | "in_progress" | "completed" | "overdue"
  partner_email?: string
  created_at: string
  user_id: string
}

interface AppUser {
  id: string
  email: string
  user_metadata: {
    full_name?: string
  }
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    partner_email: "",
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchTasks()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/signin")
      return
    }
    setUser(user)
    setLoading(false)
  }

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            ...newTask,
            user_id: user.id,
            status: "pending",
          },
        ])
        .select()

      if (error) throw error

      setTasks([...data, ...tasks])
      setNewTask({ title: "", description: "", deadline: "", partner_email: "" })
      setShowNewTaskDialog(false)
    } catch (error) {
      console.error("Error creating task:", error)
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

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      setTasks(tasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your tasks today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/calendar">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800/50 bg-transparent">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </Link>
          <Link href="/dashboard/tasks">
            <Button className="bg-teal-400 hover:bg-teal-500 text-slate-950 font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-teal-400/30 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-400/20 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold">Create Task</h3>
                <p className="text-sm text-slate-400">Add a new task to your list</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-purple-400/30 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Add Partner</h3>
                <p className="text-sm text-slate-400">Invite an accountability partner</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-blue-400/30 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-slate-400">Check your productivity stats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentTasks />
        <ActivityFeed />
      </div>

      {/* Upcoming Deadlines */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Tasks due in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No upcoming deadlines</p>
            <p className="text-sm text-slate-500">You're all caught up! 🎉</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
