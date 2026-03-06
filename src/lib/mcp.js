/**
 * MCP Client utility for calling tools on the Sony Ecosystem MCP Server.
 */

const RAW_MCP_URL = process.env.MCP_SERVER_URL || 'http://localhost:8080';

function resolveMcpEndpoint() {
    const normalized = RAW_MCP_URL.replace(/\/+$/, '');
    if (normalized.endsWith('/message')) {
        return normalized;
    }
    return `${normalized}/message`;
}

export async function callMcpTool(toolName, args) {
    try {
        const response = await fetch(resolveMcpEndpoint(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'tools/call',
                params: {
                    name: toolName,
                    arguments: args
                }
            })
        });

        if (!response.ok) {
            throw new Error(`MCP Server responded with ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`MCP Error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        if (data.result?.isError) {
            const errorText = data.result.content?.map(c => c.text).join('\n') || 'Unknown tool error';
            throw new Error(errorText);
        }

        // Return the combined text content
        return data.result?.content?.map(c => c.text).join('\n') || '';
    } catch (error) {
        console.error(`Failed to call MCP tool ${toolName}:`, error);
        throw error;
    }
}
