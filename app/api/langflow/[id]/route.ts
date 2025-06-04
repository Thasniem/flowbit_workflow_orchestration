import { NextRequest } from "next/server"
import { streamFlowLogs } from "@/lib/langflow"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const { readable, writer } = new TransformStream()
  const encoder = new TextEncoder()

  streamFlowLogs(id, (log) => {
    writer.getWriter().write(encoder.encode(`data: ${JSON.stringify(log)}\n\n`))
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  })
}
