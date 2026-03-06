import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import { initializeFirebase } from './firebase.js';

import { registerTools } from './handlers/tools.js';
import { registerResources } from './handlers/resources.js';
import { registerPrompts } from './handlers/prompts.js';

async function main() {
    try {
        console.error('Initializing Firebase Admin SDK...');
        initializeFirebase();
        console.error('Firebase Initialized.');

        console.error('Initializing Sony Ecosystem MCP Server...');
        // Need a unique server reference to pass to transport
        const mcpServer = new Server(
            {
                name: 'sony-ecosystem-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                },
            }
        );

        // Register all handlers
        registerTools(mcpServer);
        registerResources(mcpServer);
        registerPrompts(mcpServer);

        // Error handling
        mcpServer.onerror = (error) => console.error('[MCP Error]', error);

        process.on('SIGINT', async () => {
            await mcpServer.close();
            process.exit(0);
        });

        // express app
        const app = express();

        // CORS config - allow all for now, can restrict later
        const corsOptions = {
            origin: '*',
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type'],
        };
        app.use(cors(corsOptions));

        let sseTransport: SSEServerTransport | null = null;

        // SSE endpoint for initialization
        app.get("/sse", async (req, res) => {
            console.log("New SSE connection...");
            sseTransport = new SSEServerTransport("/message", res);
            // Only connect the MCP server once
            await mcpServer.connect(sseTransport);
            console.log("MCP Server connected to SSE transport.");
        });

        // Message endpoint for receiving JSON-RPC via POST
        app.post("/message", express.json(), async (req, res) => {
            if (!sseTransport) {
                res.status(400).send("No active SSE connection.");
                return;
            }
            console.log("Received POST message:", req.body);
            await sseTransport.handlePostMessage(req, res);
        });

        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Sony Ecosystem MCP Server actively running on HTTP port ${PORT}`);
            console.log(`SSE URL: http://localhost:${PORT}/sse`);
            console.log(`Message URL: http://localhost:${PORT}/message`);
        });

    } catch (err) {
        console.error('Fatal initialization error:', err);
        process.exit(1);
    }
}

main().catch(console.error);
