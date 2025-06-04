// hooks/use-execution-stream.ts
import { useEffect, useState } from 'react';

export function useExecutionStream(runId: string) {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!runId) return;

    const eventSource = new EventSource(`/api/langflow/${runId}/route`);

    eventSource.onmessage = (event) => {
      setLogs((prevLogs) => [...prevLogs, event.data]);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [runId]);

  return logs;
}
