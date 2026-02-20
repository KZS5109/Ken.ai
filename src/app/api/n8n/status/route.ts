import { NextRequest, NextResponse } from 'next/server';

const N8N_ENDPOINT = process.env.N8N_ENDPOINT || 'https://kzs5109-n8n.hf.space';
const N8N_MCP_TEST_ENDPOINT = process.env.N8N_MCP_TEST_ENDPOINT || 'https://kzs5109-n8n.hf.space/mcp-test/33fd6bb1-0e63-45cd-b923-e7c15592f036';
const N8N_API_KEY = process.env.N8N_API_KEY;

export async function GET() {
  try {
    // Check n8n connection by trying to fetch workflows
    const workflowsResponse = await fetch(`${N8N_ENDPOINT}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY || '',
      },
    });

    // Test MCP endpoint
    const mcpTestResponse = await fetch(N8N_MCP_TEST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY || '',
      },
      body: JSON.stringify({
        action: 'test',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => null);

    const workflows = workflowsResponse.ok ? await workflowsResponse.json() : [];
    const mcpTestOk = mcpTestResponse?.ok || false;

    const tools = workflows.map((workflow: any) => ({
      name: workflow.name,
      description: workflow.description || 'n8n workflow',
      endpoint: `${N8N_ENDPOINT}/webhook/${workflow.id}`,
      active: workflow.active,
    }));

    // Add MCP test tool if available
    if (mcpTestOk) {
      tools.push({
        name: 'mcp-test',
        description: 'MCP Test Endpoint',
        endpoint: N8N_MCP_TEST_ENDPOINT,
        active: true,
      });
    }

    return NextResponse.json({
      connected: true,
      endpoint: N8N_ENDPOINT,
      mcpTestEndpoint: N8N_MCP_TEST_ENDPOINT,
      mcpTestAvailable: mcpTestOk,
      tools,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      endpoint: N8N_ENDPOINT,
      mcpTestEndpoint: N8N_MCP_TEST_ENDPOINT,
      tools: [],
      error: error instanceof Error ? error.message : 'Connection failed',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tool, params, useMcpTest } = await request.json();

    let endpoint = N8N_ENDPOINT;
    
    // Use MCP test endpoint if requested
    if (useMcpTest || tool === 'mcp-test') {
      endpoint = N8N_MCP_TEST_ENDPOINT;
    } else if (tool) {
      endpoint = `${N8N_ENDPOINT}/webhook/${tool}`;
    }

    // Call n8n webhook
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY || '',
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
