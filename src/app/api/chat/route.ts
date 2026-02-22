import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const N8N_ENDPOINT = process.env.N8N_ENDPOINT || 'https://kzs5109-n8n.hf.space';
const N8N_API_KEY = process.env.N8N_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { message, toolMode, images } = await request.json();

    if (!message && (!images || images.length === 0)) {
      return Response.json({ error: 'Message or images required' }, { status: 400 });
    }

    // Build message content for Llama 4 Scout (supports text + images)
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

    // Define tools based on toolMode and general availability
    const tools = {
      // Web search tool - always available
      web_search: {
        description: 'Search the web for current information, news, or facts. Use this when the user asks about recent events, current information, or anything that requires up-to-date knowledge.',
        inputSchema: z.object({
          query: z.string().describe('The search query to look up on the web'),
        }),
        execute: async ({ query }: { query: string }) => {
          try {
            // Using DuckDuckG for web search (free, no API key required)
            const searchResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, {
              headers: {
                'Accept': 'application/json',
              },
            });

            if (searchResponse.ok) {
              const data = await searchResponse.json();
              return {
                success: true,
                query,
                results: {
                  abstract: data.Abstract,
                  topic: data.Heading,
                  relatedTopics: data.RelatedTopics?.slice(0, 5).map((t: any) => ({
                    text: t.Text,
                    url: t.FirstURL,
                  })) || [],
                },
              };
            }

            // Fallback: Use a simple search simulation
            return {
              success: true,
              query,
              note: 'Search results limited. Consider providing general knowledge response.',
            };
          } catch (error) {
            return {
              success: false,
              query,
              error: error instanceof Error ? error.message : 'Search failed',
            };
          }
        },
      },
      // n8n workflow tool - only when toolMode is enabled
      ...(toolMode ? {
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
      } : {}),
    };

    const result = streamText({
      model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      messages: [
        {
          role: 'system',
          content: `You are Gwen, an advanced AI assistant powered by Llama 4 Scout via Groq Cloud.

Capabilities:
- Native vision-language understanding (images, diagrams, screenshots, documents, OCR)
- Ultra-fast inference on Groq Cloud (~400 tokens/sec)
- Web search for current information and facts
- Help with development tasks, debugging, and architecture
- Execute n8n workflows when Tool Mode is enabled

Web Search Usage:
- Use web_search when users ask about current events, news, recent information
- Use web_search for facts that might have changed
- Use web_search when you need up-to-date information
- Always cite sources when using search results

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
