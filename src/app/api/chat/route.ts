import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const N8N_ENDPOINT = process.env.N8N_ENDPOINT || 'https://kzs5109-n8n.hf.space';
const N8N_API_KEY = process.env.N8N_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message, toolMode, images } = await request.json();

    if (!message && (!images || images.length === 0)) {
      return Response.json({ error: 'Message or images required' }, { status: 400 });
    }

    // Build message content for Qwen3.5 Plus VL (supports text + images)
    let content: any = [];
    
    if (message) {
      content.push({
        type: 'text',
        text: message,
      });
    }
    
    if (images && images.length > 0) {
      images.forEach((imageUrl: string) => {
        content.push({
          type: 'image',
          image: imageUrl,
        });
      });
    }

    // Define tools based on toolMode
    const tools = toolMode
      ? {
          execute_n8n_workflow: {
            description: 'Execute an n8n workflow automation',
            inputSchema: z.object({
              workflow_name: z.string().describe('The name of the n8n workflow to execute'),
              params: z.record(z.string(), z.any()).optional().describe('Parameters to pass to the workflow'),
            }),
            execute: async ({ workflow_name, params }: { workflow_name: string; params?: Record<string, any> }) => {
              try {
                const headers: HeadersInit = {
                  'Content-Type': 'application/json',
                };
                if (N8N_API_KEY) {
                  headers['X-N8N-API-KEY'] = N8N_API_KEY;
                }

                const response = await fetch(`${N8N_ENDPOINT}/webhook/${workflow_name}`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(params || {}),
                });

                if (!response.ok) {
                  throw new Error(`n8n API error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                return {
                  success: true,
                  workflow: workflow_name,
                  result,
                };
              } catch (error) {
                return {
                  success: false,
                  workflow: workflow_name,
                  error: error instanceof Error ? error.message : 'Unknown error',
                };
              }
            },
          },
        }
      : undefined;

    const result = streamText({
      model: openrouter('qwen/qwen3.5-plus-02-15'),
      messages: [
        {
          role: 'system',
          content: `You are Gwen, an advanced AI assistant powered by Qwen3.5 Plus via OpenRouter.

Capabilities:
- Native vision-language understanding (images, diagrams, screenshots, documents)
- Advanced reasoning with thinking mode for complex problems
- Help with development tasks, debugging, and architecture
- Execute n8n workflows when Tool Mode is enabled

When users upload images:
- Describe what you see in detail
- Read any text present (OCR)
- Identify code, diagrams, UI elements, charts
- Provide relevant analysis based on context

When Tool Mode is active:
- Use the execute_n8n_workflow tool to run automations
- Explain what workflow you're calling and why
- Report results clearly to the user`,
        },
        {
          role: 'user',
          content: content.length === 1 && content[0].type === 'text' 
            ? content[0].text 
            : content,
        },
      ],
      tools,
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 4096,
      providerOptions: {
        openrouter: {
          include_reasoning: true,
        },
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
