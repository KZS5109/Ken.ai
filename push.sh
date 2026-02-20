#!/bin/bash
# Quick push to GitHub script for Gwen

cd /home/kzs5109/Gwen

echo "🚀 Pushing Gwen to GitHub..."
echo ""
echo "You'll be prompted for GitHub credentials."
echo ""
echo "💡 Use a Personal Access Token (PAT) as your password:"
echo "   1. Go to https://github.com/settings/tokens"
echo "   2. Generate a new token with 'repo' scope"
echo "   3. Use the token as your password"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Check your repo at:"
    echo "   https://github.com/KZS5109/Gwen"
    echo ""
    echo "Next: Deploy to Vercel at https://vercel.com/new"
else
    echo ""
    echo "❌ Push failed. Try SSH instead:"
    echo "   git remote set-url origin git@github.com:KZS5109/Gwen.git"
    echo "   git push -u origin main"
fi
