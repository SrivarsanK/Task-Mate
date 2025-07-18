"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, Clock, Plus, Users, Mail } from "lucide-react"

interface ActivityItem {
  id: string
  type: "task_created" | "task_completed" | "task_updated" | "partner_added" | "reminder_sent"
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  color: string
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock activity data - in real app, fetch from API
    const mockActivities: ActivityItem[] = [
      {
        id: "1",
        type: "task_completed",
        title: "Task Completed",
        description: "Finished 'Review quarterly reports'",
        timestamp: "2 hours ago",
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: "text-green-400",
      },
      {
        id: "2",
        type: "task_created",
        title: "New Task Created",
        description: "Added 'Prepare presentation for client meeting'",
        timestamp: "4 hours ago",
        icon: <Plus className="w-4 h-4" />,
        color: "text-teal-400",
      },
      {
        id: "3",
        type: "partner_added",
        title: "Partner Added",
        description: "Added john@example.com as accountability partner",
        timestamp: "1 day ago",
        icon: <Users className="w-4 h-4" />,
        color: "text-purple-400",
      },
      {
        id: "4",
        type: "reminder_sent",
        title: "Reminder Sent",
        description: "Email reminder sent for 'Submit expense reports'",
        timestamp: "2 days ago",
        icon: <Mail className="w-4 h-4" />,
        color: "text-blue-400",
      },
      {
        id: "5",
        type: "task_updated",
        title: "Task Updated",
        description: "Changed status of 'Website redesign' to In Progress",
        timestamp: "3 days ago",
        icon: <Clock className="w-4 h-4" />,
        color: "text-yellow-400",
      },
    ]

    setTimeout(() => {
      setActivities(mockActivities)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8 bg-slate-800 border border-slate-700">
                  <AvatarFallback className={`${activity.color} bg-transparent`}>{activity.icon}</AvatarFallback>
                </Avatar>
                {index < activities.length - 1 && <div className="absolute top-8 left-4 w-px h-6 bg-slate-700"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                    {activity.timestamp}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
