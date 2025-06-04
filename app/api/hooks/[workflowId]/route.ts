import { NextRequest, NextResponse } from "next/server"
import { runFlow } from "@/lib/langflow"

export async function POST(req: NextRequest, { params }: { params: { workflowId: string } }) {
  const { workflowId } = params
  const payload = await req.json()

  try {
    const result = await runFlow(workflowId, payload)
    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
