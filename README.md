# Gwen - Developer Cockpit

**Gwen** (GUI + Qwen) is a modern AI-powered developer cockpit built with Next.js, designed to be deployed on Vercel. It features a clean, responsive UI with shadcn/ui components, light/dark mode support, integrates with OpenRouter for Qwen AI access, and n8n for workflow automation.

![Gwen Developer Cockpit](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black?logo=shadcn&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)
![OpenRouter](https://img.shields.io/badge/Provider-OpenRouter-black?logo=openai&logoColor=white)

## ✨ Features

- 🌐 **Browser-based** - Works on desktop and mobile browsers
- 🌓 **Light/Dark Mode** - Seamless theme switching
- 💬 **Streaming Responses** - Real-time token streaming from Qwen AI via OpenRouter
- 🔧 **Tool Mode** - Toggle n8n workflow integration on/off
- 📊 **System Status Panel** - Real-time n8n connectivity and MCP tool schemas
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- ⚙️ **Configurable** - n8n endpoint and API key stored server-side
- 🚀 **Vercel Ready** - Deploy with zero configuration
- 🔑 **OpenRouter** - Access Qwen models without phone verification

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Gwen Developer Cockpit                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Main Chat Area                                      │    │
│  │  - Markdown + Code Highlighting                      │    │
│  │  - Raycast-style Floating Input                      │    │
│  │  - Tool Mode Toggle                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                              ┌──────────────────────────┐   │
│                              │  System Status Sidebar   │   │
│                              │  - n8n Connection        │   │
│                              │  - MCP Tool Schemas      │   │
│                              │  - System Info           │   │
│                              └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Serverless                         │
│  ┌─────────────────────┐    ┌─────────────────────────┐    │
│  │  POST /api/chat     │    │  GET /api/n8n/status    │    │
│  │  - Qwen OAuth       │    │  - Check connection     │    │
│  │  - Stream responses │    │  - Fetch tools          │    │
│  │  - Tool interception│    │  - Return schemas       │    │
│  └─────────────────────┘    └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
            │                                    │
            ▼                                    ▼
    ┌───────────────┐                    ┌───────────────┐
    │  Qwen API     │                    │  n8n Webhook  │
    │  (qwen-code)  │                    │  (HF Space)   │
    └───────────────┘                    └───────────────┘
```

## 📁 Project Structure

```
gwen/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts          # Chat API with streaming + tool interception
│   │   │   └── n8n/
│   │   │       ├── route.ts          # n8n webhook proxy
│   │   │       └── status/
│   │   │           └── route.ts      # n8n connection status
│   │   ├── settings/
│   │   │   └── page.tsx              # Settings page
│   │   ├── globals.css               # Global styles + Tailwind
│   │   ├── layout.tsx                # Root layout + ThemeProvider
│   │   └── page.tsx                  # Developer Cockpit (main page)
│   ├── components/
│   │   ├── chat/
│   │   │   └── chat-interface.tsx    # Main chat component (Raycast-style)
│   │   ├── layout/
│   │   │   ├── system-status.tsx     # Right sidebar status panel
│   │   │   └── theme-provider.tsx    # next-themes provider
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── scroll-area.tsx
│   │       ├── separator.tsx
│   │       ├── toggle.tsx
│   │       └── tooltip.tsx
│   ├── hooks/                        # Custom React hooks
│   ├── lib/
│   │   └── utils.ts                  # cn() utility function
│   └── stores/
│       ├── chat-store.ts             # Chat state (Zustand)
│       └── settings-store.ts         # Settings state (Zustand)
├── .env.example                      # Environment variables template
├── .env.local                        # Local environment (gitignored)
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind configuration
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. **Navigate to the project:**
   ```bash
   cd gwen
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```bash
   # OpenRouter Configuration (Required)
   OPENROUTER_API_KEY=sk-or-v1-your_api_key_here
   # Get your key from https://openrouter.ai/keys

   # Model Configuration
   NEXT_PUBLIC_DEFAULT_MODEL=qwen/qwen-2.5-coder-32b

   # n8n Configuration (Optional)
   N8N_ENDPOINT=https://kzs5109-n8n.hf.space
   N8N_API_KEY=your_n8n_api_key
   N8N_MCP_TEST_ENDPOINT=https://kzs5109-n8n.hf.space/mcp-test/your-workflow-id
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Chat Interface

- **Type a message** in the floating input bar at the bottom
- **Enable Tool Mode** using the toggle in the header to activate n8n integration
- **View responses** with Markdown formatting and code syntax highlighting
- **Check system status** in the right sidebar (desktop only)

### Tool Mode

When Tool Mode is enabled:

1. Gwen detects tool-related keywords in your messages
2. Automatically intercepts and routes tool calls to n8n
3. Displays tool execution status in the chat
4. Shows tool results with JSON formatting

### Settings

Access settings at `/settings`:

- Toggle light/dark theme
- Configure n8n endpoint
- Update n8n API key

Settings are persisted in localStorage.

## 📦 Deployment to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Gwen Developer Cockpit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables:
     - `OPENROUTER_API_KEY` - Your OpenRouter API key (get from https://openrouter.ai)
     - `NEXT_PUBLIC_DEFAULT_MODEL` - Model name (default: qwen/qwen-2.5-coder-32b)
     - `N8N_ENDPOINT` - Your n8n instance URL (optional)
     - `N8N_API_KEY` - Your n8n API key (optional)
   - Click Deploy

3. **Production URL:**
   Your app will be available at `https://your-app.vercel.app`

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key for Qwen access | ✅ Yes |
| `NEXT_PUBLIC_DEFAULT_MODEL` | Model to use (e.g., `qwen/qwen-2.5-coder-32b`) | ❌ No (default set) |
| `N8N_ENDPOINT` | n8n instance URL | ❌ No |
| `N8N_API_KEY` | n8n API key | ❌ No |
| `N8N_MCP_TEST_ENDPOINT` | n8n MCP test workflow endpoint | ❌ No |

### Getting OpenRouter API Key

1. Go to https://openrouter.ai/keys
2. Sign in or create an account
3. Create a new API key
4. Copy the key to `.env.local`

**Benefits of OpenRouter:**
- No phone verification required
- Access to multiple Qwen models
- Pay-per-use pricing
- Unified API for different providers

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Markdown**: react-markdown + remark-gfm
- **Syntax Highlighting**: rehype-highlight
- **Icons**: Lucide React
- **Theming**: next-themes
- **Deployment**: Vercel Serverless Functions

## 📝 API Routes

### POST /api/chat

Handles chat messages with streaming support.

**Request:**
```json
{
  "message": "Hello, Gwen!",
  "toolMode": false
}
```

**Response:** Streaming text/plain

### GET /api/n8n/status

Returns n8n connection status and available tools.

**Response:**
```json
{
  "connected": true,
  "endpoint": "https://kzs5109-n8n.hf.space",
  "tools": [
    {
      "name": "my-workflow",
      "description": "Process data",
      "endpoint": "https://.../webhook/123",
      "active": true
    }
  ]
}
```

### POST /api/n8n

Proxy for n8n webhook calls.

**Request:**
```json
{
  "tool": "workflow-name",
  "params": { "key": "value" }
}
```

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with inspiration from [@qwen-code/qwen-code](https://www.npmjs.com/package/@qwen-code/qwen-code)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Powered by Qwen AI models
