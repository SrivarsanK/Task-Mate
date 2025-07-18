import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { taskId, reminderType } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        *,
        profiles!tasks_user_id_fkey (
          email,
          full_name
        )
      `)
      .eq("id", taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if reminder already sent
    const { data: existingReminder } = await supabase
      .from("email_reminders")
      .select("id")
      .eq("task_id", taskId)
      .eq("reminder_type", reminderType)
      .single()

    if (existingReminder) {
      return NextResponse.json({ message: "Reminder already sent" })
    }

    const userEmail = task.profiles.email
    const userName = task.profiles.full_name || userEmail
    const taskTitle = task.title
    const deadline = new Date(task.deadline).toLocaleDateString()

    let subject = ""
    let htmlContent = ""

    switch (reminderType) {
      case "24_hours_before":
        subject = `⏰ Reminder: "${taskTitle}" is due tomorrow`
        htmlContent = `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: white; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #2dd4bf, #0891b2); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">TaskMate Reminder</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #2dd4bf; margin-bottom: 16px;">Hi ${userName}! 👋</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Just a friendly reminder that your task <strong>"${taskTitle}"</strong> is due tomorrow (${deadline}).
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                You've got this! Stay focused and make it happen. 💪
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="background: #2dd4bf; color: #0f172a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                  View Task
                </a>
              </div>
            </div>
          </div>
        `
        break

      case "deadline":
        subject = `🚨 "${taskTitle}" is due today!`
        htmlContent = `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: white; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #f59e0b, #dc2626); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Task Due Today!</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #f59e0b; margin-bottom: 16px;">Hi ${userName}! ⚡</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Your task <strong>"${taskTitle}"</strong> is due today (${deadline}).
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Time to take action! Complete your task and mark it as done. 🎯
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="background: #f59e0b; color: #0f172a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                  Complete Task
                </a>
              </div>
            </div>
          </div>
        `
        break

      case "24_hours_after":
        subject = `📋 Follow-up: How did "${taskTitle}" go?`
        htmlContent = `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: white; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Task Follow-up</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #8b5cf6; margin-bottom: 16px;">Hi ${userName}! 📝</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Your task <strong>"${taskTitle}"</strong> was due yesterday (${deadline}).
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                If you completed it, don't forget to mark it as done! If not, no worries - you can still complete it or reschedule. 🔄
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                  Update Task
                </a>
              </div>
            </div>
          </div>
        `
        break
    }

    // Send email to user
    await resend.emails.send({
      from: "TaskMate <noreply@taskmate.app>",
      to: [userEmail],
      subject,
      html: htmlContent,
    })

    // Send email to partner if exists
    if (task.partner_email) {
      const partnerSubject = `📋 TaskMate: "${taskTitle}" update from ${userName}`
      const partnerHtml = `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: white; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2dd4bf, #0891b2); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">TaskMate Partner Update</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #2dd4bf; margin-bottom: 16px;">Hi there! 👋</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              ${userName} has asked you to be their accountability partner for the task: <strong>"${taskTitle}"</strong>
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Deadline: ${deadline}
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Help them stay accountable by checking in on their progress! 🤝
            </p>
          </div>
        </div>
      `

      await resend.emails.send({
        from: "TaskMate <noreply@taskmate.app>",
        to: [task.partner_email],
        subject: partnerSubject,
        html: partnerHtml,
      })
    }

    // Record reminder as sent
    await supabase.from("email_reminders").insert([
      {
        task_id: taskId,
        reminder_type: reminderType,
        recipient_email: userEmail,
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending reminder:", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
