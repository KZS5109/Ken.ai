# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+
- OpenRouter API key (https://openrouter.ai)
- n8n instance (optional, for tool integration)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/gwen.git
   cd gwen
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your API keys:**
   Edit `.env.local`:
   ```bash
   # OpenRouter API Key (required for AI)
   OPENROUTER_API_KEY=sk-or-v1-your-key-here

   # Default model
   NEXT_PUBLIC_DEFAULT_MODEL=qwen/qwen-2.5-coder-32b

   # n8n Configuration (optional)
   N8N_API_KEY=your_n8n_api_key
   N8N_ENDPOINT=https://your-n8n-instance.com
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   Navigate to http://localhost:3000

## Deployment to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Gwen Developer Cockpit"
   git remote add origin https://github.com/your-username/gwen.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Configure environment variables:
     - `OPENROUTER_API_KEY`
     - `N8N_API_KEY` (optional)
     - `N8N_ENDPOINT` (optional)
   - Click Deploy

## Security Notes

⚠️ **IMPORTANT:** Never commit your `.env.local` file!

- `.env.local` is in `.gitignore` by default
- Always store API keys in environment variables
- For Vercel, add keys in the Vercel dashboard
- If you accidentally commit keys, rotate them immediately

## Troubleshooting

**"OpenRouter API key not configured"**
- Check that `OPENROUTER_API_KEY` is set in `.env.local`
- Restart the dev server after changing env vars

**"n8n connection failed"**
- Verify your n8n instance is running
- Check that `N8N_API_KEY` is correct
- Ensure `N8N_ENDPOINT` points to your n8n URL
