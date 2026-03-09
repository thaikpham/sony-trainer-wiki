import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
    console.log('Starting Test Client...');

    // Create a transport that spawns our MCP server
    const transport = new StdioClientTransport({
        command: 'node',
        args: [join(__dirname, 'build', 'index.js')],
    });

    const client = new Client(
        { name: 'test-client', version: '1.0.0' },
        { capabilities: {} }
    );

    console.log('Connecting to server...');
    await client.connect(transport);
    console.log('Connected successfully!\n');

    console.log('--- Requesting Resources List ---');
    const resources = await client.listResources();
    console.log(JSON.stringify(resources, null, 2));

    console.log('\n--- Requesting Product List Resource ---');
    try {
        const productsInfo = await client.readResource({ uri: 'sony://system/product-list' });
        console.log(JSON.stringify(productsInfo, null, 2));
    } catch (e) {
        console.log('Error reading product-list:', e.message);
    }

    console.log('\n--- Testing Tool: search_trainer_wiki_rag ---');
    const ragResult = await client.callTool({
        name: 'search_trainer_wiki_rag',
        arguments: { query: 'how to setup fx3 for cinematic vlog' }
    });
    console.log(JSON.stringify(ragResult, null, 2));

    console.log('\n--- Testing Tool: get_product_specs (Using A7M4 string) ---');
    try {
        const specsResult = await client.callTool({
            name: 'get_product_specs',
            arguments: { model_id: 'A7M4' }
        });
        console.log(JSON.stringify(specsResult, null, 2));
    } catch (e) {
        console.log('Error fetching specs (might not exist in Firebase yet):', e.message);
    }

    console.log('\nAll tests completed successfully. Server and client are communicating via JSON-RPC Stdio!');
    process.exit(0);
}

test().catch(console.error);
