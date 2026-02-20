import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'qwen/qwen-2.5-coder-32b';

const N8N_ENDPOINT = process.env.N8N_ENDPOINT || 'https://kzs5109-n8n.hf.space';
const N8N_MCP_TEST_ENDPOINT = process.env.N8N_MCP_TEST_ENDPOINT || 'https://kzs5109-n8n.hf.space/mcp-test/33fd6bb1-0e63-45cd-b923-e7c15592f036';
const N8N_API_KEY = process.env.N8N_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message, toolMode } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Check if this is a tool call request
          if (toolMode) {
            // Try to detect if user wants to use an n8n tool
            const toolKeywords = ['workflow', 'run', 'execute', 'trigger', 'n8n', 'tool'];
            const isToolRequest = toolKeywords.some(keyword => 
              message.toLowerCase().includes(keyword)
            );

            if (isToolRequest) {
              // Simulate tool call detection
              const toolCallData = {
                name: 'n8n-mcp-test',
                endpoint: N8N_MCP_TEST_ENDPOINT,
                params: { query: message },
              };

              // Send tool call marker
              controller.enqueue(
                encoder.encode(`[TOOL_CALL]${JSON.stringify(toolCallData)}[/TOOL_CALL]\n\n`)
              );

              // Call n8n MCP test endpoint
              try {
                const n8nResponse = await fetch(N8N_MCP_TEST_ENDPOINT, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-API-KEY': N8N_API_KEY || '',
                  },
                  body: JSON.stringify({
                    action: 'query',
                    params: { query: message },
                    timestamp: new Date().toISOString(),
                  }),
                });

                if (n8nResponse.ok) {
                  const result = await n8nResponse.json();
                  controller.enqueue(
                    encoder.encode(`**MCP Test Result:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n\n`)
                  );
                } else {
                  controller.enqueue(
                    encoder.encode(`**Tool Error:** n8n returned ${n8nResponse.status}\n\n`)
                  );
                }
              } catch (n8nError) {
                controller.enqueue(
                  encoder.encode(`**Tool Error:** ${n8nError instanceof Error ? n8nError.message : 'Unknown error'}\n\n`)
                );
              }
            }
          }

          // Call OpenRouter API (Qwen model)
          if (!OPENROUTER_API_KEY) {
            // Fallback: demo mode without API key
            const fallbackResponses = [
              `**Note:** OpenRouter API key not configured.\n\nYou said: "${message}"\n\nTo enable full Qwen AI responses:\n1. Set OPENROUTER_API_KEY in your .env.local file\n2. Get your API key from https://openrouter.ai\n\nFor now, this is a demo response.`,
              `I'm Gwen, your AI assistant powered by Qwen models via OpenRouter. Currently running in demo mode.\n\n**Your message:** ${message}\n\nWhen fully configured, I'll be able to:\n- Answer questions using Qwen AI\n- Execute n8n workflows when Tool Mode is enabled\n- Help you with code and development tasks`,
            ];

            const response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            const chunks = response.split(' ');
            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(chunk + ' '));
              await new Promise((resolve) => setTimeout(resolve, 30));
            }
            controller.close();
            return;
          }

          const qwenResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://gwen.vercel.app',
              'X-Title': 'Gwen Developer Cockpit',
            },
            body: JSON.stringify({
              model: DEFAULT_MODEL,
              messages: [
                {
                  role: 'system',
                  content: 'You are Gwen, a helpful AI assistant powered by Qwen models. You can help with coding, development tasks, and when Tool Mode is enabled, you can execute n8n workflows.',
                },
                {
                  role: 'user',
                  content: message,
                },
              ],
              stream: true,
            }),
          });

          if (!qwenResponse.ok) {
            const errorData = await qwenResponse.text().catch(() => 'Unknown error');
            const errorMessage = `\n**OpenRouter API Error:** ${qwenResponse.status}\n${errorData}\n\nPlease check your API key and model configuration.`;
            controller.enqueue(encoder.encode(errorMessage));
            controller.close();
            return;
          }

          // Stream the Qwen response
          const reader = qwenResponse.body?.getReader();
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          }
          controller.close();
        } catch (error) {
          const errorMessage = `\n**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n`;
          controller.enqueue(encoder.encode(errorMessage));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
