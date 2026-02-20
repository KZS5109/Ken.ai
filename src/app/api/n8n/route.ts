import { NextRequest, NextResponse } from 'next/server';

const N8N_ENDPOINT = process.env.N8N_ENDPOINT || 'https://kzs5109-n8n.hf.space';
const N8N_API_KEY = process.env.N8N_API_KEY;

export async function GET() {
  try {
    // Try to fetch available workflows from n8n
    const response = await fetch(`${N8N_ENDPOINT}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
      },
    });

    if (response.ok) {
      const workflows = await response.json();
      const tools = workflows.map((workflow: any) => ({
        name: workflow.name,
        description: workflow.description || 'n8n workflow',
        endpoint: `${N8N_ENDPOINT}/webhook/${workflow.id}`,
        active: workflow.active,
      }));

      return NextResponse.json({
        connected: true,
        tools,
      });
    } else {
      return NextResponse.json({
        connected: false,
        tools: [],
        error: 'Failed to fetch workflows',
      });
    }
  } catch (error) {
    return NextResponse.json({
      connected: false,
      tools: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tool, params } = await request.json();

    if (!tool) {
      return NextResponse.json({ error: 'Tool name required' }, { status: 400 });
    }

    // Call n8n webhook
    const response = await fetch(`${N8N_ENDPOINT}/webhook/${tool}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
      },
      body: JSON.stringify(params || {}),
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('n8n API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
