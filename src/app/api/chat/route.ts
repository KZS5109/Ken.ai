import { NextRequest } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_MCP_TEST_ENDPOINT || 'https://kzs5109-n8n.hf.space/webhook/1f5cd19b-f72e-49f0-a00f-519a0bd76751';

export async function POST(request: NextRequest) {
  try {
    const { message, toolMode, images } = await request.json();

    if (!message && (!images || images.length === 0)) {
      return Response.json({ error: 'Message or images required' }, { status: 400 });
    }

    // Build the payload for n8n webhook
    const payload: any = {
      message: message || '',
      timestamp: new Date().toISOString(),
    };

    if (images && images.length > 0) {
      payload.images = images;
    }

    if (toolMode) {
      payload.toolMode = true;
    }

    console.log('[v0] Calling n8n webhook:', N8N_WEBHOOK_URL);
    console.log('[v0] Payload:', payload);

    // Call n8n webhook with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] n8n webhook error response:', errorText);
      throw new Error(`n8n webhook error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Get the response from n8n
    const result = await response.json();
    console.log('[v0] n8n response:', result);
    
    // Return as a stream to maintain compatibility with the frontend
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const output = result.output || result.message || result.response || JSON.stringify(result);
        controller.enqueue(encoder.encode(output));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[v0] Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[v0] Error message:', errorMessage);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
