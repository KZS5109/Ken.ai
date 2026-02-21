'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Server, Wrench, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function SystemStatus() {
  const { n8nConnected, availableTools, setN8NConnected, setAvailableTools } = useChatStore();
  const { n8nEndpoint } = useSettingsStore();
  const [checking, setChecking] = useState(false);
  const [mcpTestAvailable, setMcpTestAvailable] = useState(false);

  const checkN8NConnection = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/n8n/status', {
        method: 'GET',
      });
      const data = await response.json();
      setN8NConnected(data.connected);
      setMcpTestAvailable(data.mcpTestAvailable || false);
      if (data.tools) {
        setAvailableTools(data.tools);
      }
    } catch (error) {
      setN8NConnected(false);
      setMcpTestAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkN8NConnection();
  }, [n8nEndpoint]);

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Status Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <h2 className="font-semibold">System Status</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={checkN8NConnection}
            disabled={checking}
          >
            <RefreshCw size={16} className={cn(checking && "animate-spin")} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* n8n Connection Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-muted-foreground" />
                <CardTitle className="text-sm">n8n Connection</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {n8nEndpoint}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {checking ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Checking...</span>
                  </>
                ) : n8nConnected ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">Disconnected</span>
                  </>
                )}
              </div>
              {mcpTestAvailable && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 size={12} />
                  <span>MCP Test Endpoint Available</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Tools */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-muted-foreground" />
                <CardTitle className="text-sm">MCP Tools</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {availableTools.length} tool{availableTools.length !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableTools.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No tools configured. Enable Tool Mode and configure n8n workflows.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableTools.map((tool, index) => (
                    <React.Fragment key={tool.name}>
                      {index > 0 && <Separator className="my-2" />}
                      <div
                        key={tool.name}
                        className={cn(
                          "p-2 rounded-md text-xs space-y-1",
                          tool.active ? "bg-green-500/10" : "bg-muted"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{tool.name}</span>
                          {tool.active ? (
                            <CheckCircle2 size={12} className="text-green-500" />
                          ) : (
                            <XCircle size={12} className="text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-muted-foreground">{tool.description}</p>
                        <code className="block mt-1 px-1.5 py-0.5 bg-muted rounded text-[10px] overflow-x-auto">
                          {tool.endpoint}
                        </code>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">System Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium">Qwen3.5 Plus VL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reasoning</span>
                <span className="font-medium text-green-600 dark:text-green-400">Thinking Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vision</span>
                <span className="font-medium text-green-600 dark:text-green-400">Supported</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streaming</span>
                <span className="font-medium text-green-600 dark:text-green-400">Enabled</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
