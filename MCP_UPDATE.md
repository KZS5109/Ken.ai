# n8n MCP Test Endpoint Update

## What Changed

Updated Gwen to use your n8n MCP test endpoint at:
```
https://kzs5109-n8n.hf.space/mcp-test/33fd6bb1-0e63-45cd-b923-e7c15592f036
```

## Files Modified

### 1. Environment Variables
**`.env.local`** - Added MCP test endpoint:
```bash
N8N_MCP_TEST_ENDPOINT=https://kzs5109-n8n.hf.space/mcp-test/33fd6bb1-0e63-45cd-b923-e7c15592f036
```

**`.env.example`** - Updated template for others to follow.

### 2. API Routes

**`/api/n8n/status`** - Now tests both:
- Main n8n endpoint (`/api/v1/workflows`)
- MCP test endpoint (POST request with test payload)

Returns:
```json
{
  "connected": true,
  "mcpTestAvailable": true,
  "mcpTestEndpoint": "https://kzs5109-n8n.hf.space/mcp-test/...",
  "tools": [...]
}
```

**`/api/chat`** - Tool Mode now uses MCP test endpoint:
- Detects tool-related keywords
- Sends `[TOOL_CALL]` markers to UI
- Calls MCP test endpoint with query
- Displays results in chat

### 3. UI Components

**`SystemStatus`** component - Now shows:
- ✅ n8n connection status
- ✅ MCP Test Endpoint availability badge
- ✅ List of available tools including MCP test

## How to Test

### 1. Enable Tool Mode
Toggle the "Tool Mode" switch in the chat header.

### 2. Send Tool-Related Messages
Try these prompts:
- "Run the MCP test workflow"
- "Execute n8n tool"
- "Trigger a workflow"
- "Test the MCP endpoint"

### 3. Check System Status
Open the right sidebar and verify:
- n8n shows "Connected"
- "MCP Test Endpoint Available" badge appears
- Tools list includes "mcp-test"

## Expected Behavior

When Tool Mode is enabled and you send a message:

1. **Tool Call Detection** → Gwen detects tool keywords
2. **Tool Call Marker** → Shows `[TOOL_CALL]` in stream
3. **MCP Test Execution** → Calls your n8n MCP test endpoint
4. **Result Display** → Shows JSON response in chat

Example response in chat:
```
**MCP Test Result:**
```json
{
  "status": "success",
  "data": {...}
}
```
```

## Configuration

### Environment Variables
```bash
# Main n8n instance
N8N_ENDPOINT=https://kzs5109-n8n.hf.space

# API authentication
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MCP Test Endpoint (your workflow)
N8N_MCP_TEST_ENDPOINT=https://kzs5109-n8n.hf.space/mcp-test/33fd6bb1-0e63-45cd-b923-e7c15592f036
```

### For Vercel Deployment
Add these environment variables in Vercel dashboard:
- `N8N_ENDPOINT`
- `N8N_API_KEY`
- `N8N_MCP_TEST_ENDPOINT`

## Troubleshooting

### MCP Test Not Available
1. Check that the workflow ID is correct in the URL
2. Verify n8n instance is running
3. Check API key is valid

### Tool Calls Not Triggering
1. Enable Tool Mode toggle
2. Use keywords: "workflow", "run", "execute", "trigger", "n8n", "tool"
3. Check browser console for errors

### Connection Failed
1. Verify n8n HF Space is not sleeping (visit to wake it up)
2. Check CORS settings in n8n
3. Test endpoint manually:
   ```bash
   curl -X POST https://kzs5109-n8n.hf.space/mcp-test/33fd6bb1-0e63-45cd-b923-e7c15592f036 \
     -H "Content-Type: application/json" \
     -H "X-N8N-API-KEY: your_key" \
     -d '{"action": "test"}'
   ```

## Next Steps

1. **Test Locally:**
   ```bash
   cd /home/kzs5109/gwen
   npm run dev
   ```

2. **Enable Tool Mode** in the UI

3. **Send a test message** like "Run the MCP test"

4. **Check System Status** sidebar for connection

5. **Deploy to Vercel** when ready (add env vars first!)

---

**Status:** ✅ MCP Test Endpoint Integrated
