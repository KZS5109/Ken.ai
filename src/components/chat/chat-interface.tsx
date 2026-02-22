'use client';

import React, { useState, useRef, useEffect, ChangeEvent, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  Send, Bot, User, Wrench, Loader2, XCircle, Paperclip, File, X, 
  ChevronDown, ChevronUp, BrainCircuit, PanelLeftClose, PanelLeftOpen, FileCode 
} from 'lucide-react';
import { useChatStore, Attachment } from '@/stores/chat-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { FilePreview, FilePreviewPanel, PreviewFile, detectFileType, detectLanguage } from '@/components/tools/file-preview';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  files?: PreviewFile[];
}

function ChatMessageItem({ 
  message, 
  onFileClick 
}: { 
  message: Message;
  onFileClick: (file: PreviewFile) => void;
}) {
  const isUser = message.role === 'user';
  const content = message.content;

  // Extract code blocks as previewable files
  const codeBlocks = useMemo(() => {
    const blocks: PreviewFile[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let index = 0;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      blocks.push({
        id: `code-${message.id}-${index++}`,
        name: `snippet.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language}`,
        type: 'code',
        content: code,
        language,
      });
    }
    return blocks;
  }, [content, message.id]);

  return (
    <div
      className={cn(
        "flex gap-4 p-4 animate-in fade-in slide-in-from-bottom-2",
        isUser ? "bg-muted/30" : "bg-background"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isUser ? 'You' : 'Gwen'}
          </span>
        </div>

        {/* Attachments display */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((attachment, idx) => (
              <div
                key={idx}
                onClick={() => onFileClick({
                  id: attachment.id,
                  name: attachment.file.name,
                  type: attachment.type === 'image' ? 'image' : detectFileType(attachment.file.name),
                  content: attachment.preview,
                  url: attachment.preview,
                })}
                className="relative group rounded-lg overflow-hidden border bg-card cursor-pointer hover:border-primary transition-colors"
              >
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="h-20 w-20 object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center bg-muted">
                    <File size={24} className="text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 truncate">
                  {attachment.file.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        {content && (
          <div className="prose dark:prose-invert max-w-none text-sm">
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
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Code blocks preview */}
        {codeBlocks.length > 0 && !isUser && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Generated Files:</p>
            <div className="flex flex-wrap gap-2">
              {codeBlocks.map((file) => (
                <div
                  key={file.id}
                  onClick={() => onFileClick(file)}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                >
                  <FileCode size={16} className="text-primary" />
                  <span className="text-xs font-medium">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PreviewFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useSettingsStore();
  const { toolMode, attachments, addAttachment, removeAttachment, clearAttachments } = useChatStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment: Attachment = {
          id: `${file.name}-${Date.now()}`,
          file,
          preview: event.target?.result as string,
          type: isImage ? 'image' : 'file',
        };
        addAttachment(attachment);
        
        // Also add to preview files
        const previewFile: PreviewFile = {
          id: attachment.id,
          name: file.name,
          type: isImage ? 'image' : detectFileType(file.name),
          content: event.target?.result as string,
          url: event.target?.result as string,
          language: detectLanguage(file.name),
          size: file.size,
        };
        setPreviewFiles((prev) => [...prev, previewFile]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachmentItem = (id: string) => {
    removeAttachment(id);
    setPreviewFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFileClick = (file: PreviewFile) => {
    setSelectedFile(file);
    setShowPreviewPanel(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const imageDataList = attachments
      .filter((a) => a.type === 'image')
      .map((a) => a.preview);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    clearAttachments();
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          toolMode,
          images: imageDataList,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const assistantMessageId = (Date.now() + 1).toString();
      let assistantContent = '';

      // Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantContent += chunk;

        // Update assistant message with streaming content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId 
              ? { ...m, content: assistantContent.trim() }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `**Error:** ${err instanceof Error ? err.message : 'Failed to get response'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("flex h-screen overflow-hidden", theme)}>
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col h-full">
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
                      pressed={showPreviewPanel}
                      onPressedChange={setShowPreviewPanel}
                      className="gap-2"
                    >
                      {showPreviewPanel ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                      <span className="hidden sm:inline">Files</span>
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showPreviewPanel ? 'Hide preview panel' : 'Show preview panel'}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={toolMode}
                      onPressedChange={() => {
                        const store = useChatStore.getState();
                        store.toggleToolMode();
                        setMessages([]);
                      }}
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
            <div className="flex-1 overflow-hidden">
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
                            Your AI-powered developer cockpit with Llama 4 Scout on Groq Cloud. 
                            Ultra-fast responses with vision support. Upload images, ask questions, or enable Tool Mode for n8n workflows.
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
                      <ChatMessageItem 
                        key={message.id} 
                        message={message}
                        onFileClick={handleFileClick}
                      />
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
            </div>

            {/* Input */}
            <footer className="p-4 border-t bg-card">
              <div className="max-w-4xl mx-auto">
                <form
                  onSubmit={handleSubmit}
                  className="relative flex items-end gap-2 p-2 rounded-xl border bg-background shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all"
                >
                  {toolMode && (
                    <div className="absolute -top-8 left-2 flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-full animate-in fade-in slide-in-from-bottom-2">
                      <Wrench size={12} />
                      <span>Tool Mode Active</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.txt,.doc,.docx,.js,.ts,.py,.json,.md"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2 w-full">
                    {attachments.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="relative group shrink-0 rounded-lg overflow-hidden border bg-card"
                          >
                            {attachment.type === 'image' ? (
                              <img
                                src={attachment.preview}
                                alt={attachment.file.name}
                                className="h-16 w-16 object-cover"
                              />
                            ) : (
                              <div className="h-16 w-16 flex items-center justify-center bg-muted">
                                <File size={24} className="text-muted-foreground" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeAttachmentItem(attachment.id)}
                              className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 truncate">
                              {attachment.file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            className="shrink-0"
                          >
                            <Paperclip size={18} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Attach files or images
                        </TooltipContent>
                      </Tooltip>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={toolMode ? "Ask anything or trigger an n8n workflow..." : "Type your message..."}
                        className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm min-h-[40px]"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || (!input.trim() && attachments.length === 0)}
                        className="shrink-0"
                      >
                        {isLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Powered by Llama 4 Scout via Groq Cloud. Ultra-fast inference with vision support. Tool Mode enables n8n workflow integration.
                </p>
              </div>
            </footer>
          </div>
        </main>

        {/* Preview Panel */}
        {showPreviewPanel && (
          <aside className="w-96 border-l bg-muted/30 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b bg-card">
              <h2 className="font-semibold">File Preview</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowPreviewPanel(false);
                  setSelectedFile(null);
                }}
              >
                <X size={16} />
              </Button>
            </div>
            {previewFiles.length > 0 ? (
              selectedFile ? (
                <FilePreview 
                  file={selectedFile} 
                  onClose={() => setSelectedFile(null)}
                />
              ) : (
                <FilePreviewPanel 
                  files={previewFiles}
                  onClose={() => setShowPreviewPanel(false)}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <File size={48} />
                <p className="mt-4 text-sm text-center">No files uploaded yet</p>
                <p className="text-xs text-center mt-2">
                  Attach files using the paperclip icon to preview them here
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </TooltipProvider>
  );
}
