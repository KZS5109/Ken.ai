'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion } from 'framer-motion';
import {
  Send, Plus, MessageSquare, Trash2, Menu, X,
  Copy, Check, Sparkles, Paperclip, File, Image as ImageIcon, Eye, FileText, Code
} from 'lucide-react';
import { useChatStore, Attachment, Message } from '@/stores/chat-store';
import { useSettingsStore, PreviewItem } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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
      className="absolute top-2 right-2 h-7 w-7 rounded-md bg-muted/50 hover:bg-muted transition-colors"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </Button>
  );
}

function ChatMessageItem({ message, onAttachmentClick }: { message: Message; onAttachmentClick?: (attachment: Attachment) => void }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "message-animation flex gap-4 py-4 px-6",
        isUser ? "bg-transparent" : "bg-secondary/30"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5",
        isUser
          ? "bg-gradient-to-br from-blue-500 to-blue-600"
          : "bg-gradient-to-br from-orange-400 to-orange-500"
      )}>
        {isUser ? (
          <span className="text-xs font-semibold text-white">U</span>
        ) : (
          <Sparkles size={14} className="text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">
            {isUser ? 'You' : 'Karma.Ai'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.attachments.map((attachment, idx) => (
              <div
                key={idx}
                className="relative group rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onAttachmentClick?.(attachment)}
              >
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 flex items-center justify-center bg-muted">
                    <File size={24} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message Text */}
        {message.content && (
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser ? "text-foreground" : "text-foreground"
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const codeContent = String(children).replace(/\n$/, '');
                  const language = className?.replace('language-', '') || 'text';
                  return !inline ? (
                    <div className="relative group -mx-2 my-3">
                      <pre className="bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                      <CopyButton code={codeContent} />
                    </div>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface PreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  previewItems: PreviewItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  panelWidth: number;
  onPanelWidthChange: (width: number) => void;
}

function PreviewPanel({ isOpen, onClose, previewItems, onRemove, onClear, panelWidth, onPanelWidthChange }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'code' | 'pdf' | 'file'>('all');
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(200, Math.min(600, window.innerWidth - e.clientX));
      onPanelWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onPanelWidthChange]);

  const filteredItems = activeTab === 'all'
    ? previewItems
    : previewItems.filter(item => item.type === activeTab);

  const renderPreview = (item: PreviewItem) => {
    switch (item.type) {
      case 'image':
        return (
          <div className="relative group">
            <img
              src={item.content}
              alt={item.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="h-8 w-8 rounded-full bg-destructive/90 hover:bg-destructive"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        );
      case 'code':
        return (
          <div className="relative group bg-[#1e1e1e] rounded-lg overflow-hidden border border-border">
            <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-border">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-blue-400" />
                <span className="text-xs font-mono text-muted-foreground">{item.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="h-6 w-6 rounded hover:bg-destructive/20 hover:text-destructive"
              >
                <X size={14} />
              </Button>
            </div>
            <ScrollArea className="h-48">
              <pre className="p-3 text-xs font-mono text-muted-foreground overflow-x-auto">
                <code>{item.content}</code>
              </pre>
            </ScrollArea>
          </div>
        );
      case 'pdf':
        return (
          <div className="relative group bg-muted rounded-lg overflow-hidden border border-border">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-red-400" />
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{item.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="h-6 w-6 rounded hover:bg-destructive/20 hover:text-destructive"
              >
                <X size={14} />
              </Button>
            </div>
            <div className="h-48 flex items-center justify-center bg-muted/30">
              <div className="text-center space-y-2">
                <FileText size={48} className="mx-auto text-red-400" />
                <p className="text-xs text-muted-foreground">PDF Preview</p>
                <a
                  href={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="relative group bg-muted rounded-lg overflow-hidden border border-border">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <File size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{item.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="h-6 w-6 rounded hover:bg-destructive/20 hover:text-destructive"
              >
                <X size={14} />
              </Button>
            </div>
            <div className="h-48 flex items-center justify-center">
              <File size={48} className="text-muted-foreground" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? panelWidth : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "flex flex-col border-l bg-sidebar-bg overflow-hidden",
          isOpen ? `w-[${panelWidth}px]` : "w-0"
        )}
        style={{ width: isOpen ? `${panelWidth}px` : 0 }}
      >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-muted-foreground" />
          <span className="font-semibold text-sm">Preview</span>
        </div>
        <div className="flex items-center gap-1">
          {previewItems.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-7 w-7 rounded hover:bg-destructive/20 hover:text-destructive"
              title="Clear all"
            >
              <Trash2 size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 rounded"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-border shrink-0">
        {(['all', 'image', 'code', 'pdf', 'file'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "h-7 px-2 text-xs capitalize",
              activeTab === tab && "bg-secondary"
            )}
          >
            {tab}
            {tab !== 'all' && (
              <span className="ml-1 text-muted-foreground">
                ({previewItems.filter(i => i.type === tab).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Preview Items */}
      <ScrollArea className="flex-1 p-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Eye size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No previews</p>
              <p className="text-xs text-muted-foreground mt-1">
                {previewItems.length === 0
                  ? "Upload files to preview them"
                  : `No ${activeTab} files`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {renderPreview(item)}
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="text-xs text-muted-foreground text-center">
          {previewItems.length} item{previewItems.length !== 1 ? 's' : ''} in preview
        </div>
      </div>
    </motion.aside>
      {/* Resize Handle */}
      {isOpen && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 left-0 w-1 h-full bg-transparent hover:bg-primary/50 cursor-col-resize transition-colors",
            isResizing && "bg-primary"
          )}
          title="Drag to resize"
        />
      )}
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [panelWidth, setPanelWidth] = useState(320);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, showPreviewPanel, previewItems, togglePreviewPanel, addPreviewItem, removePreviewItem, clearPreviewItems } = useSettingsStore();
  const {
    conversations,
    currentConversationId,
    isLoading,
    attachments,
    addConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    updateMessage,
    setLoading,
    addAttachment,
    removeAttachment,
    clearAttachments,
    getCurrentConversation,
  } = useChatStore();

  const currentConversation = getCurrentConversation();
  const messages = currentConversation?.messages || [];

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
      const isPdf = file.type === 'application/pdf';
      const isCode = ['text/javascript', 'text/typescript', 'text/x-python', 'application/json', 'text/markdown'].includes(file.type) ||
        /\.(js|ts|py|json|md|tsx|jsx)$/i.test(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment: Attachment = {
          id: `${file.name}-${Date.now()}`,
          file,
          preview: event.target?.result as string,
          type: isImage ? 'image' : 'file',
        };
        addAttachment(attachment);

        // Add to preview panel
        let previewType: 'image' | 'pdf' | 'code' | 'file' = 'file';
        if (isImage) previewType = 'image';
        else if (isPdf) previewType = 'pdf';
        else if (isCode) previewType = 'code';

        const previewItem: PreviewItem = {
          id: attachment.id,
          name: file.name,
          type: previewType,
          content: event.target?.result as string,
        };
        addPreviewItem(previewItem);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput('');
    clearAttachments();
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
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

      // Create empty assistant message
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      addMessage(assistantMessage);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        assistantContent += chunk;
        updateMessage(assistantMessageId, assistantContent.trim());
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `**Error:** ${err instanceof Error ? err.message : 'Failed to get response'}`,
        timestamp: Date.now(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    addConversation();
  };

  const handleAttachmentClick = (attachment: Attachment) => {
    const previewItem: PreviewItem = {
      id: attachment.id,
      name: attachment.file.name,
      type: attachment.type,
      content: attachment.preview,
    };
    addPreviewItem(previewItem);
    if (!showPreviewPanel) {
      togglePreviewPanel();
    }
  };

  return (
    <div className={cn("flex h-screen overflow-hidden", theme)}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: showSidebar ? 260 : 0,
          opacity: showSidebar ? 1 : 0
        }}
        className={cn(
          "flex flex-col border-r bg-sidebar-bg overflow-hidden",
          showSidebar ? "w-[260px]" : "w-0"
        )}
      >
        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 h-10 rounded-lg border border-border bg-background hover:bg-sidebar-hover transition-colors"
            variant="outline"
          >
            <Plus size={18} />
            <span className="font-medium">New chat</span>
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5 py-2">
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  conv.id === currentConversationId
                    ? "bg-sidebar-active"
                    : "hover:bg-sidebar-hover"
                )}
                onClick={() => switchConversation(conv.id)}
              >
                <MessageSquare size={16} className="text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm truncate">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground px-2">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-9 w-9"
            >
              {showSidebar ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <div>
              <h1 className="font-semibold text-lg">Karma.Ai</h1>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePreviewPanel}
              className={cn(
                "h-9 w-9",
                showPreviewPanel && "bg-secondary"
              )}
              title="Toggle preview panel"
            >
              <Eye size={18} />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-md p-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500">
                      <Sparkles size={32} className="text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-semibold">How can I help today?</h2>
                    <p className="text-muted-foreground mt-2">
                      Ask me anything, upload files, or let's collaborate on a task.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessageItem key={message.id} message={message} onAttachmentClick={handleAttachmentClick} />
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4 py-4 px-6 bg-secondary/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500">
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-muted-foreground text-sm">Karma.Ai is thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <footer className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative group shrink-0 rounded-lg overflow-hidden border border-border"
                  >
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.preview}
                        alt={attachment.file.name}
                        className="h-16 w-16 object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center bg-muted">
                        <File size={20} className="text-muted-foreground" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Field */}
            <div className="relative flex items-end gap-2 p-2 rounded-xl border bg-card focus-within:ring-2 focus-within:ring-ring transition-all">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 h-9 w-9 rounded-lg"
              >
                <Paperclip size={18} />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt,.doc,.docx,.js,.ts,.py,.json,.md"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Ken.ai..."
                className="flex-1 px-2 py-2.5 bg-transparent focus:outline-none text-sm min-h-[40px] placeholder:text-muted-foreground/60"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className="shrink-0 h-9 w-9 rounded-lg"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>

            {/* Footer Text */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Karma.Ai can make mistakes. Please verify important information.
            </p>
          </form>
        </footer>
      </main>

      {/* Preview Panel */}
      <PreviewPanel
        isOpen={showPreviewPanel}
        onClose={togglePreviewPanel}
        previewItems={previewItems}
        onRemove={removePreviewItem}
        onClear={clearPreviewItems}
        panelWidth={panelWidth}
        onPanelWidthChange={setPanelWidth}
      />
    </div>
  );
}
