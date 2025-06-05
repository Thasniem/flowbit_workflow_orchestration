import { NextResponse } from "next/server"

// Mock data for when API connections fail
// Update mock data to use ISO timestamps
const mockN8nExecutions = [
  {
    id: "n8n-exec-1",
    workflowId: "wf-1",
    workflowName: "Email Processor",
    engine: "n8n",
    status: "success",
    duration: "2.3s",
    startTime: "2024-01-15T14:30:22.000Z",  // ISO format
    triggerType: "webhook",
    folderId: "unassigned",
    executionData: {
      data: {
        resultData: {
          runData: {
            Webhook: [{ data: { body: { email: "test@example.com" } }, executionTime: 120 }],
            "Process Email": [{ data: { output: "Email processed" }, executionTime: 350 }],
          },
        },
      },
    },
  },
  {
    id: "n8n-exec-2",
    workflowId: "wf-3",
    workflowName: "Lead Scoring",
    engine: "n8n",
    status: "error",
    duration: "1.1s",
    startTime: "2024-01-15T14:25:15.000Z",
    triggerType: "webhook",
    folderId: "marketing",
    executionData: {
      data: {
        resultData: {
          error: { message: "Failed to process lead data" },
        },
      },
    },
  },
  {
    id: "n8n-exec-3",
    workflowId: "wf-6",
    workflowName: "Report Generator",
    engine: "n8n",
    status: "running",
    duration: "Running...",
    startTime: "2024-01-15T14:35:10.000Z",
    triggerType: "schedule",
    folderId: "data-processing",
    executionData: {
      data: {
        resultData: {
          runData: {
            "Data Fetch": [{ data: { records: 500 }, executionTime: 1200 }],
          },
        },
      },
    },
  },
]

const mockLangflowExecutions = [
  {
    id: "langflow-exec-1",
    workflowId: "wf-5",
    workflowName: "ETL Pipeline",
    engine: "langflow",
    status: "success",
    duration: "45.2s",
    startTime: "2024-01-15T14:20:08.000Z",
    triggerType: "schedule",
    folderId: "data-processing",
    executionData: {
      outputs: {
        "Data Source": { status: "success", data: { records: 1250 } },
        Transform: { status: "success", data: { transformations: ["join", "filter"] } },
      },
    },
  },
  {
    id: "langflow-exec-2",
    workflowId: "wf-2",
    workflowName: "Data Sync",
    engine: "langflow",
    status: "success",
    duration: "12.7s",
    startTime: "2024-01-15T14:15:33.000Z",
    triggerType: "manual",
    folderId: "unassigned",
    executionData: {
      outputs: {
        Sync: { status: "success", data: { synced: true } },
      },
    },
  },
  {
    id: "langflow-exec-3",
    workflowId: "wf-4",
    workflowName: "Campaign Tracker",
    engine: "langflow",
    status: "error",
    duration: "8.1s",
    startTime: "2024-01-15T14:10:15.000Z",
    triggerType: "webhook",
    folderId: "marketing",
    executionData: {
      outputs: {
        "Campaign Data": { status: "error", error: "API rate limit exceeded" },
      },
      error: "API rate limit exceeded",
    },
  },
]

// Create a timeout promise
function createTimeoutPromise(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), ms)
  })
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const errorInfo = {
      url,
      code: (error as any)?.cause?.code || (error as any)?.code || 'UNKNOWN',
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error)
    };

    console.error('Network Failure:', errorInfo);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchLangflowExecutions() {
  const langflowBaseUrl = process.env.LANGFLOW_BASE_URL;
  const langflowApiKey = process.env.LANGFLOW_API_KEY;

  console.log("Langflow Service URL:", `${langflowBaseUrl}/api/v1/runs`);
  console.log("Langflow API Key:", langflowApiKey ? "***REDACTED***" : "Not set");

  if (!langflowBaseUrl || !langflowApiKey) {
    console.warn("Langflow configuration incomplete. Using mock data");
    return mockLangflowExecutions;
  }

  try {
    const response = await fetchWithTimeout(
      `${langflowBaseUrl}/api/v1/runs`,
      {
        headers: {
          Authorization: `Bearer ${langflowApiKey}`,
          "Content-Type": "application/json",
        },
      },
      5000
    );

    console.log(`Langflow API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Langflow API Error ${response.status}: ${errorBody}`);
      return mockLangflowExecutions;
    }

    const data = await response.json();
    return data.runs.map((run: any) => ({
      id: run.id,
      workflowId: run.flow_id,
      workflowName: run.flow_name || "Unknown Flow",
      engine: "langflow",
      status: run.status === "SUCCESS" ? "success" : run.status === "ERROR" ? "error" : "running",
      duration: run.duration ? `${run.duration.toFixed(1)}s` : "N/A",
      startTime: new Date(run.timestamp).toISOString(),
      triggerType: run.trigger_type || "manual",
      folderId: run.tags?.[0] || "unassigned",
      executionData: run,
    }));
  } catch (error) {
    console.error("Langflow Connection Failed - Verify service running at:", langflowBaseUrl);
    return mockLangflowExecutions;
  }
}

// Fix 1: Remove duplicate fields in response mappings
async function fetchN8nExecutions() {
  const n8nBaseUrl = process.env.N8N_BASE_URL;
  const n8nApiKey = process.env.N8N_API_KEY;

  console.log("N8N Service URL:", `${n8nBaseUrl}/rest/executions`);
  console.log("N8N API Key:", n8nApiKey ? "***REDACTED***" : "Not set");

  if (!n8nBaseUrl || !n8nApiKey) {
    console.warn("N8N configuration incomplete. Using mock data");
    return mockN8nExecutions;
  }

  try {
    const response = await fetchWithTimeout(
      `${n8nBaseUrl}/rest/executions`,
      {
        headers: {
          Authorization: `Bearer ${n8nApiKey}`,
          "Content-Type": "application/json",
        },
      },
      5000
    );

    console.log(`N8N API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`N8N API Error ${response.status}: ${errorBody}`);
      return mockN8nExecutions;
    }

    const data = await response.json();
    // In fetchN8nExecutions response mapping
    return data.data.map((execution: any) => ({
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflowData?.name || "Unknown Workflow",
      engine: "n8n",
      status: execution.finished ? (execution.stoppedAt ? "success" : "error") : "running",
      duration: execution.finished
        ? `${((new Date(execution.stoppedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(1)}s`
        : "Running...",
      startTime: execution.startedAt ? 
        new Date(execution.startedAt).toISOString() : 
        new Date().toISOString(), // Fallback to current time
    }));
    
    // In fetchLangflowExecutions response mapping
    return data.runs.map((run: any) => ({
      id: run.id,
      workflowId: run.flow_id,
      workflowName: run.flow_name || "Unknown Flow",
      engine: "langflow",
      status: run.status === "SUCCESS" ? "success" : run.status === "ERROR" ? "error" : "running",
      duration: run.duration ? `${run.duration.toFixed(1)}s` : "N/A",
      startTime: run.timestamp ? 
        new Date(run.timestamp).toISOString() : 
        new Date().toISOString(), // Fallback to current time
    }));
  } catch (error) {
    console.error("N8N Connection Failed - Verify service running at:", n8nBaseUrl);
    return mockN8nExecutions;
  }
}

export async function GET() {
  try {
    console.log("=== Fetching executions from all sources ===")

    // Use Promise.allSettled to handle cases where one API fails but the other succeeds
    const [n8nResult, langflowResult] = await Promise.allSettled([fetchN8nExecutions(), fetchLangflowExecutions()])

    // Extract results or use empty arrays for failed promises
    const n8nExecutions = n8nResult.status === "fulfilled" ? n8nResult.value : mockN8nExecutions
    const langflowExecutions = langflowResult.status === "fulfilled" ? langflowResult.value : mockLangflowExecutions

    console.log(`N8N executions: ${n8nExecutions.length}`)
    console.log(`Langflow executions: ${langflowExecutions.length}`)

    const allExecutions = [...n8nExecutions, ...langflowExecutions]
      .sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime() // Fix 5: Direct date comparison
      })
      .slice(0, 50)

    console.log(`Returning ${allExecutions.length} total executions`)

    // Determine if we're using any mock data
    const usingMockData =
      n8nResult.status === "rejected" ||
      langflowResult.status === "rejected" ||
      !process.env.N8N_BASE_URL ||
      !process.env.N8N_API_KEY ||
      !process.env.LANGFLOW_BASE_URL ||
      !process.env.LANGFLOW_API_KEY

    return NextResponse.json({
      executions: allExecutions,
      usingMockData,
      message: usingMockData ? "Using mock data due to API configuration or connection issues" : "Live data",
    })
  } catch (error) {
    console.error("Unexpected error in executions API route:", error)

    // Return mock data as ultimate fallback
    const mockExecutions = [...mockN8nExecutions, ...mockLangflowExecutions].sort((a, b) => {
      const dateA = a.startTime.split(" ")[0].split(".").reverse().join("-") + " " + a.startTime.split(" ")[1]
      const dateB = b.startTime.split(" ")[0].split(".").reverse().join("-") + " " + b.startTime.split(" ")[1]
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    return NextResponse.json({
      executions: mockExecutions,
      usingMockData: true,
      message: "Falling back to mock data due to server error",
    });
  }
}
