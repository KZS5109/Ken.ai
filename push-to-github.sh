#!/bin/bash

# Gwen - Push to GitHub Script
# Run this script to push your code to GitHub

echo "🚀 Pushing Gwen to GitHub..."
echo ""

# Navigate to project directory
cd /home/kzs5109/gwen

# Check if git is configured
if ! git config user.name > /dev/null 2>&1; then
    echo "⚙️  Configuring git user..."
    git config user.email "kzs5109@users.noreply.github.com"
    git config user.name "KZS5109"
fi

# Rename branch to main if needed
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" = "master" ]; then
    echo "📦 Renaming branch to main..."
    git branch -M main
fi

# Add remote if not already added
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/KZS5109/Gwen.git
else
    echo "✅ Remote already configured"
fi

echo ""
echo "📤 Pushing to GitHub..."
echo ""
echo "💡 You'll be asked for GitHub credentials."
echo "   Use your GitHub username and a Personal Access Token (PAT)."
echo ""
echo "   To create a PAT:"
echo "   1. Go to https://github.com/settings/tokens"
echo "   2. Click 'Generate new token (classic)'"
echo "   3. Check 'repo' scope"
echo "   4. Copy the token and use it as your password"
echo ""

# Push to GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://github.com/KZS5109/Gwen"
    echo "2. Verify your code is there"
    echo "3. Go to https://vercel.com/new"
    echo "4. Import the Gwen repository"
    echo "5. Add environment variables in Vercel:"
    echo "   - OPENROUTER_API_KEY=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"
    echo "   - NEXT_PUBLIC_DEFAULT_MODEL=qwen/qwen-2.5-coder-32b"
    echo "   - N8N_ENDPOINT=https://kzs5109-n8n.hf.space"
    echo "   - N8N_API_KEY=(your n8n key)"
    echo "   - N8N_MCP_TEST_ENDPOINT=https://kzs5109-n8n.hf.space/mcp-test/33fd6bb1-0e63-45cd-b923-e7c15592f036"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please check your GitHub credentials."
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure you have a Personal Access Token (PAT)"
    echo "2. Try using SSH instead:"
    echo "   git remote set-url origin git@github.com:KZS5109/Gwen.git"
    echo "   git push -u origin main"
fi
