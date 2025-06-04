// lib/api.ts
export async function triggerWorkflow(workflowId: string, engine: string) {
    const response = await fetch('/api/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workflowId, engine })
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to trigger workflow.');
    }
  
    return response.json();
  }
  