'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Send, Bot, User, Wrench, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useChatStore, Message } from '@/stores/chat-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

function ChatMessageItem({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';

  return (
    <div
      className={cn(
        "flex gap-4 p-4 animate-in fade-in slide-in-from-bottom-2",
        isUser ? "bg-muted/30" : isTool ? "bg-accent/20" : "bg-background"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : isTool ? "bg-secondary" : "bg-secondary"
        )}
      >
        {isUser ? <User size={16} /> : isTool ? <Wrench size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isUser ? 'You' : isTool ? 'Tool' : 'Gwen'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {message.toolCall && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                message.toolCall.status === 'pending' && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                message.toolCall.status === 'success' && "bg-green-500/20 text-green-600 dark:text-green-400",
                message.toolCall.status === 'error' && "bg-red-500/20 text-red-600 dark:text-red-400"
              )}
            >
              {message.toolCall.status === 'pending' && 'Running...'}
              {message.toolCall.status === 'success' && 'Success'}
              {message.toolCall.status === 'error' && 'Failed'}
            </span>
          )}
        </div>
        <div className="prose dark:prose-invert max-w-none text-sm">
          {message.toolCall && (
            <div className="mb-2 p-2 bg-muted rounded-md text-xs font-mono">
              <div className="flex items-center gap-2 mb-1">
                {message.toolCall.status === 'pending' && <Loader2 size={12} className="animate-spin" />}
                {message.toolCall.status === 'success' && <CheckCircle2 size={12} />}
                {message.toolCall.status === 'error' && <XCircle size={12} />}
                <span className="font-semibold">{message.toolCall.name}</span>
              </div>
              {message.toolCall.result && (
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(message.toolCall.result, null, 2)}
                </pre>
              )}
            </div>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                return !inline ? (
                  <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    error,
    toolMode,
    addMessage,
    updateMessage,
    setLoading,
    setError,
  } = useChatStore();
  const { theme } = useSettingsStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          toolMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const assistantMessageId = (Date.now() + 1).toString();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantContent += chunk;

        // Check for tool call markers in the response
        if (assistantContent.includes('[TOOL_CALL]')) {
          const toolMatch = assistantContent.match(/\[TOOL_CALL\](.+?)\[\/TOOL_CALL\]/s);
          if (toolMatch) {
            const toolData = JSON.parse(toolMatch[1]);
            addMessage({
              id: (Date.now() + 2).toString(),
              role: 'tool',
              content: `Calling ${toolData.name}...`,
              timestamp: Date.now(),
              toolCall: {
                name: toolData.name,
                status: 'pending',
              },
            });
          }
        }

        // Update or create assistant message
        const existingMsg = useChatStore.getState().messages.find(m => m.id === assistantMessageId);
        if (existingMsg) {
          updateMessage(assistantMessageId, assistantContent);
        } else {
          addMessage({
            id: assistantMessageId,
            role: 'assistant',
            content: assistantContent,
            timestamp: Date.now(),
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-screen", theme)}>
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Gwen</h1>
              <p className="text-xs text-muted-foreground">Developer Cockpit</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={toolMode}
                  onPressedChange={useChatStore.getState().toggleToolMode}
                  className="gap-2"
                >
                  <Wrench size={16} />
                  <span className="hidden sm:inline">Tool Mode</span>
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                Enable n8n tool integration
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollRef}>
            <div className="space-y-1">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4 max-w-md p-8">
                    <div className="flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Bot size={32} className="text-primary" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Welcome to Gwen</h2>
                      <p className="text-muted-foreground mt-1">
                        Your AI-powered developer cockpit. Start a conversation or enable Tool Mode to use n8n workflows.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("What can you do?")}
                      >
                        What can you do?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInput("Help me write code")}
                      >
                        Help me write code
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessageItem key={message.id} message={message} />
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-4 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <Bot size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </main>

        {/* Input */}
        <footer className="p-4 border-t bg-card">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-3 p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
                <XCircle size={16} />
                {error}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center gap-2 p-2 rounded-xl border bg-background shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all"
            >
              {toolMode && (
                <div className="absolute -top-8 left-2 flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-full animate-in fade-in slide-in-from-bottom-2">
                  <Wrench size={12} />
                  <span>Tool Mode Active</span>
                </div>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={toolMode ? "Ask anything or trigger an n8n workflow..." : "Type your message..."}
                className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Gwen uses Qwen AI models. Tool Mode enables n8n workflow integration.
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
