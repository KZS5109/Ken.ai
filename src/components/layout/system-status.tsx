'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://kzs5109-n8n.hf.space/webhook/1f5cd19b-f72e-49f0-a00f-519a0bd76751';

export function SystemStatus() {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkN8NConnection = async () => {
    setChecking(true);
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true, message: 'health_check' }),
      });
      
      setConnected(response.ok);
    } catch (error) {
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkN8NConnection();
  }, []);

  return (
    <div className="flex flex-col h-full bg-sidebar-bg">
      {/* Status Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-muted-foreground" />
            <h2 className="font-semibold text-sm">System Status</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={checkN8NConnection}
            disabled={checking}
            className="h-8 w-8"
          >
            <RefreshCw size={14} className={cn(checking && "animate-spin")} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {/* n8n Connection Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium">n8n Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {checking ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Checking...</span>
                  </>
                ) : connected ? (
                  <>
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-xs text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} className="text-red-500" />
                    <span className="text-xs text-red-500">Disconnected</span>
                  </>
                )}
              </div>
              <code className="block text-[10px] text-muted-foreground break-all">
                {N8N_WEBHOOK_URL}
              </code>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium">System Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend</span>
                <span className="font-medium">n8n Workflow</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={cn("font-medium", connected ? "text-green-500" : "text-red-500")}>
                  {connected ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
