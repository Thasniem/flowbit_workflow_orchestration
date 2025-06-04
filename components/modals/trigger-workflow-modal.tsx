// components/modals/trigger-workflow-modal.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

export default function TriggerWorkflowModal() {
  const [open, setOpen] = useState(false);
  const [workflowId, setWorkflowId] = useState('');
  const [engine, setEngine] = useState('langflow');

  const handleTrigger = async () => {
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, engine }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Success', description: 'Workflow triggered successfully.' });
        setOpen(false);
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to trigger workflow.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Trigger Workflow</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trigger Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter Workflow ID"
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
          />
          <Select value={engine} onValueChange={setEngine}>
            <SelectTrigger>
              <SelectValue placeholder="Select Engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="langflow">LangFlow</SelectItem>
              <SelectItem value="n8n">n8n</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleTrigger}>Trigger</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
