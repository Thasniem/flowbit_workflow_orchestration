import { NextResponse } from "next/server"
import { runFlow } from "@/lib/langflow"

export async function POST(req: Request) {
  const body = await req.json()
  const { flowId, input } = body

  try {
    const result = await runFlow(flowId, input)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error running flow:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
