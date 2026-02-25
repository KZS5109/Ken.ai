'use client';

import React from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, toggleTheme } = useSettingsStore();

  return (
    <div className={cn("flex h-screen overflow-hidden", theme)}>
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-4">
        <div className="space-y-1">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <ArrowLeft size={16} />
              Back to Chat
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Configure your Ken.ai instance
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
            </div>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how Ken.ai looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark mode
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={toggleTheme}
                    className="gap-2"
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon size={16} /> Light
                      </>
                    ) : (
                      <>
                        <Sun size={16} /> Dark
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>About Ken.ai</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Ken.ai is a browser-based AI chatbot that connects to n8n workflows.
                  It's designed to be deployed on Vercel as a serverless application.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Framework</p>
                    <p className="text-muted-foreground">Next.js 16 (App Router)</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">UI Library</p>
                    <p className="text-muted-foreground">shadcn/ui + Tailwind</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">AI Integration</p>
                    <p className="text-muted-foreground">n8n webhook</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Deployment</p>
                    <p className="text-muted-foreground">Vercel / Node.js</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Environment variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The n8n webhook URL is configured via the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">N8N_WEBHOOK_URL</code> environment variable.
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
