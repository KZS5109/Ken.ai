#!/bin/bash

# Gwen Repository Setup Script
# Run this script to initialize git and prepare for GitHub push

echo "🚀 Setting up Gwen repository..."

# Check if .gitignore exists
if [ ! -f .gitignore ]; then
    echo "❌ .gitignore not found! Creating it..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js Build
.next/
out/
build/
dist/

# Environment Variables (CRITICAL)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS Files
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo

# Vercel
.vercel
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found! Copying from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your API keys!"
else
    echo "✅ .env.local exists (not tracked by git)"
fi

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Add files
echo "📝 Adding files to git..."
git add .
echo "✅ Files added"

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Gwen Developer Cockpit with OpenRouter"
echo "✅ Initial commit created"

echo ""
echo "✅ Repository setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub (don't add README or .gitignore)"
echo "2. Run these commands:"
echo ""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/gwen.git"
echo "   git push -u origin main"
echo ""
echo "3. Add environment variables on Vercel after deployment:"
echo "   - OPENROUTER_API_KEY"
echo "   - N8N_API_KEY (optional)"
echo "   - N8N_ENDPOINT (optional)"
echo ""
echo "⚠️  IMPORTANT: Never commit .env.local to GitHub!"
