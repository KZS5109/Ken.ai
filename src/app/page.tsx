'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { SystemStatus } from '@/components/layout/system-status';
import { useSettingsStore } from '@/stores/settings-store';
import { cn } from '@/lib/utils';

export default function DeveloperCockpit() {
  const { theme } = useSettingsStore();

  return (
    <div className={cn("flex h-screen overflow-hidden", theme)}>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatInterface />
      </main>

      {/* Right Sidebar - System Status */}
      <aside className="hidden lg:block w-80 border-l bg-muted/30 overflow-hidden">
        <SystemStatus />
      </aside>
    </div>
  );
}
