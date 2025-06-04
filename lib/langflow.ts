// lib/langflow.ts

export async function streamFlowLogs(runId: string): Promise<ReadableStream<Uint8Array>> {
    const encoder = new TextEncoder();
    let counter = 0;
  
    return new ReadableStream<Uint8Array>({
      start(controller) {
        const interval = setInterval(() => {
          // Simulated log line
          const logLine = `data: Step ${++counter} completed for run ${runId}\n\n`;
          controller.enqueue(encoder.encode(logLine));
  
          if (counter >= 5) {
            clearInterval(interval);
            controller.close();
          }
        }, 1000);
      },
      cancel(reason) {
        console.log(`Stream cancelled: ${reason}`);
      }
    });
  }
  