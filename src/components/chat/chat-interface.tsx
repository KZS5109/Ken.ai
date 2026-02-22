'use client';

import React, { useState, useRef, useEffect, ChangeEvent, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Wrench, Loader2, XCircle, Paperclip, File, X, 
  ChevronDown, ChevronUp, BrainCircuit, PanelLeftClose, PanelLeftOpen,
  Copy, Check, Sparkles
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

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="absolute top-2 right-2 h-7 w-7 rounded-md bg-muted/50 hover:bg-muted"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </Button>
  );
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-3 p-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary shadow-md"
        >
          <Bot size={16} className="text-primary-foreground" />
        </motion.div>
      )}

      {/* Message Bubble */}
      <div className={cn(
        "flex flex-col max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <motion.div
          layout
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser 
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md" 
              : "bg-muted/60 backdrop-blur-sm rounded-bl-md border border-border/50"
          )}
        >
          {/* Attachments display */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((attachment, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => onFileClick({
                    id: attachment.id,
                    name: attachment.file.name,
                    type: attachment.type === 'image' ? 'image' : detectFileType(attachment.file.name),
                    content: attachment.preview,
                    url: attachment.preview,
                  })}
                  className="relative group rounded-xl overflow-hidden border-2 border-white/20 cursor-pointer hover:border-primary/50 transition-all hover:scale-105"
                >
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="h-24 w-24 object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 flex items-center justify-center bg-muted/80 backdrop-blur">
                      <File size={28} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 truncate">
                    {attachment.file.name}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Message content */}
          {content && (
            <div className={cn(
              "prose prose-sm max-w-none",
              isUser ? "prose-invert" : "dark:prose-invert prose-slate"
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const codeContent = String(children).replace(/\n$/, '');
                    return !inline ? (
                      <div className="relative group">
                        <pre className="bg-muted/80 p-3 rounded-lg overflow-x-auto text-xs font-mono border border-border/50">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                        <CopyButton code={codeContent} />
                      </div>
                    ) : (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border border-border/30" {...props}>
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
        </motion.div>

        {/* Code blocks preview */}
        {codeBlocks.length > 0 && !isUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 flex flex-wrap gap-2"
          >
            {codeBlocks.map((file, idx) => (
              <motion.div
                key={file.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                onClick={() => onFileClick(file)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-primary/10 border border-border/50 cursor-pointer transition-all hover:scale-105"
              >
                <File size={12} className="text-primary" />
                <span className="text-xs font-medium">{file.name}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground mt-1.5 px-1">
          {new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* User Avatar */}
      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/80 shadow-md"
        >
          <User size={16} className="text-muted-foreground" />
        </motion.div>
      )}
    </motion.div>
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useSettingsStore();
  const { toolMode, attachments, addAttachment, removeAttachment, clearAttachments } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
      <div className={cn("flex h-screen overflow-hidden bg-background", theme)}>
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-primary shadow-lg"
                >
                  <Bot size={22} className="text-primary-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Gwen</h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles size={10} className="text-primary" />
                    Powered by Llama 4 Scout
                  </p>
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
                <div className="flex flex-col">
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center h-full"
                    >
                      <div className="text-center space-y-6 max-w-md p-8">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="flex justify-center"
                        >
                          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg">
                            <Bot size={40} className="text-primary" />
                          </div>
                        </motion.div>
                        <div>
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Welcome to Gwen</h2>
                          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                            Your AI-powered developer cockpit with Llama 4 Scout on Groq Cloud. 
                            <br />
                            Ultra-fast responses with vision support.
                          </p>
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="flex flex-wrap gap-2 justify-center"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInput("What can you do?")}
                            className="rounded-full"
                          >
                            What can you do?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInput("Help me write code")}
                            className="rounded-full"
                          >
                            Help me write code
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <ChatMessageItem
                          key={message.id}
                          message={message}
                          onFileClick={handleFileClick}
                        />
                      ))}
                      {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 p-4"
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary shadow-md"
                          >
                            <Bot size={16} className="text-primary-foreground" />
                          </motion.div>
                          <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-muted-foreground" />
                            <span className="text-muted-foreground text-sm">Gwen is thinking...</span>
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Input */}
            <footer className="p-4 border-t bg-card/80 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto">
                <form
                  onSubmit={handleSubmit}
                  className="relative flex items-end gap-2 p-2.5 rounded-2xl border bg-background shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
                >
                  {toolMode && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-10 left-2 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs rounded-full shadow-lg"
                    >
                      <Wrench size={12} />
                      <span>Tool Mode Active</span>
                    </motion.div>
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
                        <AnimatePresence>
                          {attachments.map((attachment) => (
                            <motion.div
                              key={attachment.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="relative group shrink-0 rounded-xl overflow-hidden border-2 border-primary/20 bg-card"
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
                                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:scale-110"
                              >
                                <X size={12} />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 truncate">
                                {attachment.file.name}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
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
                            className="shrink-0 rounded-xl hover:bg-muted/80"
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
                        placeholder={toolMode ? "Ask anything or trigger an n8n workflow..." : "Message Gwen..."}
                        className="flex-1 px-3 py-2.5 bg-transparent focus:outline-none text-sm min-h-[40px] placeholder:text-muted-foreground/60"
                        disabled={isLoading}
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="submit"
                          size="icon"
                          disabled={isLoading || (!input.trim() && attachments.length === 0)}
                          className="shrink-0 rounded-xl shadow-lg"
                        >
                          {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Send size={18} />
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </form>
                <p className="text-[10px] text-muted-foreground/70 text-center mt-2.5">
                  Powered by <span className="font-medium">Llama 4 Scout</span> via Groq Cloud · Ultra-fast inference with vision support
                </p>
              </div>
            </footer>
          </div>
        </main>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreviewPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-l bg-muted/30 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b bg-card/80 backdrop-blur-sm">
                <h2 className="font-semibold">File Preview</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowPreviewPanel(false);
                    setSelectedFile(null);
                  }}
                  className="rounded-lg"
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
                  <File size={48} className="mb-4 opacity-50" />
                  <p className="text-sm text-center">No files uploaded yet</p>
                  <p className="text-xs text-center mt-2 text-muted-foreground/70">
                    Attach files using the paperclip icon
                  </p>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
