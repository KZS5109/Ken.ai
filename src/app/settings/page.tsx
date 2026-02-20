'use client';

import React from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { ArrowLeft, Save, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { n8nEndpoint, n8nApiKey, theme, setN8NEndpoint, setN8NApiKey, toggleTheme } =
    useSettingsStore();
  const [localEndpoint, setLocalEndpoint] = React.useState(n8nEndpoint);
  const [localApiKey, setLocalApiKey] = React.useState(n8nApiKey);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setN8NEndpoint(localEndpoint);
    setN8NApiKey(localApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
                  Configure your Gwen instance
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
                  Customize how Gwen looks on your device
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

            {/* n8n Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>n8n Integration</CardTitle>
                <CardDescription>
                  Configure your n8n instance for workflow automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">n8n Endpoint</label>
                  <input
                    type="url"
                    value={localEndpoint}
                    onChange={(e) => setLocalEndpoint(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://your-n8n-instance.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">n8n API Key</label>
                  <input
                    type="password"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your n8n API key"
                  />
                  <p className="text-xs text-muted-foreground">
                    The API key is stored locally in your browser and never sent to our servers.
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button onClick={handleSave} className="gap-2">
                    <Save size={16} />
                    Save Settings
                  </Button>
                  {saved && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Settings saved!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>About Gwen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Gwen is a browser-based AI chatbox that connects to Qwen AI models
                  and n8n workflows. It's designed to be deployed on Vercel as a
                  serverless application.
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
                    <p className="font-medium">AI Model</p>
                    <p className="text-muted-foreground">Qwen-Code</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">Integration</p>
                    <p className="text-muted-foreground">n8n workflows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
