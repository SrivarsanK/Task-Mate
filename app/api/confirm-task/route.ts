import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })

    // Find confirmation by token
    const { data: confirmation, error: confirmationError } = await supabase
      .from("task_confirmations")
      .select(`
        *,
        tasks (
          id,
          title,
          user_id,
          profiles!tasks_user_id_fkey (
            email,
            full_name
          )
        )
      `)
      .eq("confirmation_token", token)
      .single()

    if (confirmationError || !confirmation) {
      return NextResponse.json({ error: "Invalid confirmation token" }, { status: 404 })
    }

    if (confirmation.confirmed_at) {
      return NextResponse.json({ error: "Task already confirmed" }, { status: 400 })
    }

    // Update confirmation
    const { error: updateError } = await supabase
      .from("task_confirmations")
      .update({ confirmed_at: new Date().toISOString() })
      .eq("id", confirmation.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to confirm task" }, { status: 500 })
    }

    // Update task status to completed
    await supabase
      .from("tasks")
      .update({
        status: "completed",
        partner_confirmed: true,
      })
      .eq("id", confirmation.task_id)

    return NextResponse.json({
      success: true,
      message: "Task confirmed successfully",
      task: confirmation.tasks,
    })
  } catch (error) {
    console.error("Error confirming task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
