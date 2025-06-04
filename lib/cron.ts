import cron from "node-cron"
import { runFlow } from "@/lib/langflow"

const scheduledJobs = new Map<string, any>()

export function scheduleCronJob(flowId: string, cronExpr: string, input = {}) {
  if (scheduledJobs.has(flowId)) {
    scheduledJobs.get(flowId).stop()
  }

  const job = cron.schedule(cronExpr, async () => {
    console.log(`[CRON] Running ${flowId} at ${new Date().toISOString()}`)
    try {
      await runFlow(flowId, input)
    } catch (err) {
      console.error(`Error in cron for ${flowId}:`, err)
    }
  })

  scheduledJobs.set(flowId, job)
}

export function cancelCronJob(flowId: string) {
  if (scheduledJobs.has(flowId)) {
    scheduledJobs.get(flowId).stop()
    scheduledJobs.delete(flowId)
  }
}
