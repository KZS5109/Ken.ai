'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  File, FileText, FileCode, FileImage, FileVideo, FileAudio, 
  FileSpreadsheet, FileBox, Download, X, Maximize2, Minimize2,
  Code, Image as ImageIcon, FileJson, FileArchive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface PreviewFile {
  id: string;
  name: string;
  type: 'code' | 'image' | 'pdf' | 'text' | 'json' | 'markdown' | 'video' | 'audio' | 'archive' | 'unknown';
  content?: string;
  url?: string;
  language?: string;
  size?: number;
}

interface FilePreviewProps {
  file: PreviewFile;
  onClose?: () => void;
  compact?: boolean;
}

function getFileIcon(type: PreviewFile['type']) {
  switch (type) {
    case 'code': return <FileCode size={20} />;
    case 'image': return <FileImage size={20} />;
    case 'pdf': return <FileText size={20} />;
    case 'text': return <FileText size={20} />;
    case 'json': return <FileJson size={20} />;
    case 'markdown': return <FileText size={20} />;
    case 'video': return <FileVideo size={20} />;
    case 'audio': return <FileAudio size={20} />;
    case 'archive': return <FileArchive size={20} />;
    default: return <FileBox size={20} />;
  }
}

function getFileTypeFromName(name: string): PreviewFile['type'] {
  const ext = name.split('.').pop()?.toLowerCase();
  const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'scala', 'sh', 'bash', 'zsh', 'fish', 'sql', 'html', 'css', 'scss', 'sass', 'less', 'vue', 'svelte', 'yaml', 'yml', 'toml', 'ini', 'conf', 'xml', 'svg'];
  
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
    case 'cs':
    case 'go':
    case 'rs':
    case 'php':
    case 'rb':
    case 'swift':
    case 'kt':
    case 'scala':
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'fish':
    case 'sql':
    case 'html':
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
    case 'vue':
    case 'svelte':
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'ini':
    case 'conf':
    case 'xml':
      return 'code';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'pdf':
      return 'pdf';
    case 'txt':
    case 'log':
      return 'text';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'bmp':
    case 'svg':
      return 'image';
    case 'mp4':
    case 'webm':
    case 'ogg':
    case 'avi':
    case 'mov':
      return 'video';
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
    case 'aac':
      return 'audio';
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
    case '7z':
      return 'archive';
    default:
      return 'unknown';
  }
}

function getLanguageFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    go: 'go',
    java: 'java',
    cs: 'csharp',
    cpp: 'cpp',
    c: 'c',
    h: 'c',
    hpp: 'cpp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    fish: 'fish',
    sql: 'sql',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    vue: 'vue',
    svelte: 'svelte',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    conf: 'ini',
    xml: 'xml',
    json: 'json',
    md: 'markdown',
    markdown: 'markdown',
  };
  return languageMap[ext || ''] || 'plaintext';
}

export function FilePreview({ file, onClose, compact = false }: FilePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    if (file.content) {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  if (compact && !isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
      >
        {getFileIcon(file.type)}
        <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
        {file.size && <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>}
        <Maximize2 size={14} className="text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border bg-card overflow-hidden",
      compact ? "" : "h-full flex flex-col"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          {getFileIcon(file.type)}
          <div>
            <h3 className="text-sm font-medium">{file.name}</h3>
            {file.size && <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {file.content && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === 'preview' ? 'raw' : 'preview')}
                title={viewMode === 'preview' ? 'Show raw' : 'Show preview'}
              >
                <Code size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Download"
              >
                <Download size={14} />
              </Button>
            </>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (compact) setIsExpanded(false);
                else onClose();
              }}
            >
              {compact ? <Minimize2 size={14} /> : <X size={14} />}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className={cn("flex-1", compact ? "max-h-64" : "flex-1")}>
        <div className="p-4">
          {/* Image Preview */}
          {file.type === 'image' && (
            <div className="flex items-center justify-center">
              {file.url ? (
                <img src={file.url} alt={file.name} className="max-w-full h-auto rounded-lg" />
              ) : file.content ? (
                <img src={file.content} alt={file.name} className="max-w-full h-auto rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon size={48} />
                  <p>Image preview not available</p>
                </div>
              )}
            </div>
          )}

          {/* PDF Preview */}
          {file.type === 'pdf' && (
            <div className="flex flex-col items-center gap-4">
              {file.url ? (
                <>
                  <iframe
                    src={file.url}
                    className="w-full h-96 rounded-lg border"
                    title={file.name}
                  />
                  <Button onClick={() => window.open(file.url, '_blank')}>
                    Open PDF in new tab
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileText size={48} />
                  <p>PDF preview not available</p>
                  {file.content && (
                    <Button onClick={handleDownload}>Download PDF</Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Video Preview */}
          {file.type === 'video' && (
            <div className="flex items-center justify-center">
              {file.url ? (
                <video controls className="max-w-full rounded-lg">
                  <source src={file.url} />
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileVideo size={48} />
                  <p>Video preview not available</p>
                </div>
              )}
            </div>
          )}

          {/* Audio Preview */}
          {file.type === 'audio' && (
            <div className="flex items-center justify-center p-8">
              {file.url ? (
                <audio controls className="w-full">
                  <source src={file.url} />
                  Your browser does not support audio playback.
                </audio>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileAudio size={48} />
                  <p>Audio preview not available</p>
                </div>
              )}
            </div>
          )}

          {/* Code/Text/JSON/Markdown Preview */}
          {(file.type === 'code' || file.type === 'text' || file.type === 'json' || file.type === 'markdown') && (
            <div className="relative">
              {viewMode === 'preview' && file.content ? (
                file.type === 'markdown' ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {file.content}
                    </ReactMarkdown>
                  </div>
                ) : file.type === 'json' ? (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    {JSON.stringify(JSON.parse(file.content), null, 2)}
                  </pre>
                ) : (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    <code className={file.language ? `language-${file.language}` : ''}>
                      {file.content}
                    </code>
                  </pre>
                )
              ) : file.content ? (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                  {file.content}
                </pre>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
                  <FileText size={48} />
                  <p>Content not available</p>
                </div>
              )}
            </div>
          )}

          {/* Archive/Unknown */}
          {(file.type === 'archive' || file.type === 'unknown') && (
            <div className="flex flex-col items-center gap-4 py-8">
              <FileArchive size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground">Preview not available for this file type</p>
              {file.url && (
                <Button onClick={() => window.open(file.url, '_blank')}>
                  Open in new tab
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function FilePreviewPanel({ files, onClose }: { files: PreviewFile[]; onClose?: () => void }) {
  const [selectedFile, setSelectedFile] = useState<PreviewFile | null>(files[0] || null);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <FileBox size={48} />
        <p className="mt-4 text-sm">No files to preview</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* File List */}
      <div className="w-48 border-r bg-muted/30 overflow-hidden flex flex-col">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold">Files</h3>
          <p className="text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors",
                  selectedFile?.id === file.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                {getFileIcon(file.type)}
                <span className="truncate flex-1">{file.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden">
        {selectedFile && (
          <FilePreview file={selectedFile} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

export function detectFileType(name: string, content?: string): PreviewFile['type'] {
  return getFileTypeFromName(name);
}

export function detectLanguage(name: string): string {
  return getLanguageFromName(name);
}
