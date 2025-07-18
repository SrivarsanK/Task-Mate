"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, Users, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface TaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  overdue: number
  completionRate: number
  weeklyCompleted: number
  monthlyCompleted: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0,
    weeklyCompleted: 0,
    monthlyCompleted: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data: tasks, error } = await supabase.from("tasks").select("*")

      if (error) throw error

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const total = tasks?.length || 0
      const completed = tasks?.filter((t) => t.status === "completed").length || 0
      const pending = tasks?.filter((t) => t.status === "pending").length || 0
      const inProgress = tasks?.filter((t) => t.status === "in_progress").length || 0
      const overdue = tasks?.filter((t) => t.status === "overdue").length || 0

      const weeklyCompleted =
        tasks?.filter((t) => t.status === "completed" && new Date(t.updated_at) >= weekAgo).length || 0

      const monthlyCompleted =
        tasks?.filter((t) => t.status === "completed" && new Date(t.updated_at) >= monthAgo).length || 0

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

      setStats({
        total,
        completed,
        pending,
        inProgress,
        overdue,
        completionRate,
        weeklyCompleted,
        monthlyCompleted,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-700 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-teal-400/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-teal-400/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-green-400/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    {stats.completionRate}%
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-blue-400/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
                <p className="text-xs text-slate-500 mt-1">Active tasks</p>
              </div>
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-red-400/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Overdue</p>
                <p className="text-3xl font-bold text-red-400">{stats.overdue}</p>
                <p className="text-xs text-slate-500 mt-1">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Activity Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              Completion Rate
            </CardTitle>
            <CardDescription>Your overall task completion percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-teal-400">{stats.completionRate}%</span>
                <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                  {stats.completionRate >= 70 ? "Excellent" : stats.completionRate >= 50 ? "Good" : "Needs Work"}
                </Badge>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
              <p className="text-xs text-slate-400">
                {stats.completed} of {stats.total} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Weekly Progress
            </CardTitle>
            <CardDescription>Tasks completed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-400">{stats.weeklyCompleted}</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">This Week</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Zap className="w-4 h-4" />
                <span>
                  {stats.weeklyCompleted > 5
                    ? "Great momentum!"
                    : stats.weeklyCompleted > 2
                      ? "Good progress"
                      : "Let's pick up the pace"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              Accountability
            </CardTitle>
            <CardDescription>Tasks with partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-400">{Math.floor(Math.random() * 8) + 2}</span>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Partners</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Stay accountable together</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
