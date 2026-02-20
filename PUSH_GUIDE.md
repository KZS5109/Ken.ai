# 🚀 Push Gwen to GitHub - Quick Guide

## Your Repository
**URL:** https://github.com/KZS5109/Gwen.git

## Option 1: Run the Script (Easiest)

```bash
cd /home/kzs5109/gwen
./push-to-github.sh
```

You'll be prompted for:
- **Username:** Your GitHub username
- **Password:** Use a Personal Access Token (PAT), not your GitHub password

### Creating a Personal Access Token (PAT)

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `Gwen Deployment`
4. Check the **`repo`** scope (full control of private repositories)
5. Click **"Generate token"** at the bottom
6. **Copy the token immediately** - you can't see it again!
7. Use this token as your password when pushing

## Option 2: Manual Commands

```bash
cd /home/kzs5109/gwen

# Configure git (if not done)
git config user.email "kzs5109@users.noreply.github.com"
git config user.name "KZS5109"

# Set remote
git remote add origin https://github.com/KZS5109/Gwen.git

# Push (you'll be prompted for credentials)
git push -u origin main
```

## Option 3: Use SSH (If you have SSH keys set up)

```bash
cd /home/kzs5109/gwen

# Use SSH instead of HTTPS
git remote set-url origin git@github.com:KZS5109/Gwen.git

# Push
git push -u origin main
```

## After Pushing Successfully

1. **Verify on GitHub:**
   - Go to https://github.com/KZS5109/Gwen
   - Check that all files are there
   - Make sure `.env.local` is NOT visible (it shouldn't be, thanks to .gitignore)

2. **Deploy to Vercel:**
   - Go to https://vercel.com/new
   - Click **"Import Git Repository"**
   - Find and import `Gwen`
   - Configure environment variables (see below)
   - Click **Deploy**

## Vercel Environment Variables

Add these in Vercel dashboard after importing:

| Name | Value |
|------|-------|
| `OPENROUTER_API_KEY` | `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` |
| `NEXT_PUBLIC_DEFAULT_MODEL` | `qwen/qwen-2.5-coder-32b` |
| `N8N_ENDPOINT` | `https://kzs5109-n8n.hf.space` |
| `N8N_API_KEY` | (your n8n key from .env.local) |
| `N8N_MCP_TEST_ENDPOINT` | `https://kzs5109-n8n.hf.space/mcp-test/33fd6bb1-0e63-45cd-b923-e7c15592f036` |

## Troubleshooting

### "Authentication failed"
- Make sure you're using a PAT, not your GitHub password
- Check that the token has `repo` scope
- Try creating a new token

### "Repository not found"
- Make sure the repo exists on GitHub
- Check the URL is correct: https://github.com/KZS5109/Gwen.git

### "Permission denied"
- Make sure you own the repository or have push access
- Try SSH if HTTPS doesn't work

### ".env.local showed up in GitHub"
⚠️ **ROTATE YOUR KEYS IMMEDIATELY!**
1. Delete the file from GitHub: `git rm --cached .env.local`
2. Commit and push: `git commit -m "Remove .env.local" && git push`
3. Create new API keys on OpenRouter and n8n
4. Update your .env.local

---

**Ready?** Run `./push-to-github.sh` and follow the prompts! 🎉
