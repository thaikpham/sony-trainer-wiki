import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getDb } from '../firebase.js';
import {
    GetProductSpecsSchema,
    SearchColorRecipesSchema,
    CompareSonyCamerasSchema,
    SearchTrainerWikiRagSchema,
    UpsertTrainerWikiKnowledgeSchema
} from '../types/index.js';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || "";
const pineconeKey = process.env.PINECONE_API_KEY || "";
const indexName = process.env.PINECONE_INDEX_NAME || "alpha-focus-wiki";

const genAI = new GoogleGenerativeAI(apiKey);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

export const registerTools = (server: Server) => {
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: 'get_product_specs',
                    description: 'Queries the products collection in Firestore. Returns detailed JSON specs of the exact model.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            model_id: {
                                type: 'string',
                                description: 'The strict alphanumeric model ID of the Sony product (e.g., A7M4, FX3).'
                            }
                        },
                        required: ['model_id']
                    }
                },
                {
                    name: 'search_color_recipes',
                    description: 'Queries the color_recipes collection based on parameters. Returns a list of matching recipes.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sensor_type: {
                                type: 'string',
                                description: 'The camera sensor generation or type (e.g., Exmor R, BSI-CMOS).'
                            },
                            style: {
                                type: 'string',
                                description: 'The desired visual style or base film character (e.g., Cinematic, Vintage, Kodak).'
                            }
                        }
                    }
                },
                {
                    name: 'compare_sony_cameras',
                    description: 'Fetches both products from Firestore and constructs a structured comparison highlighting differences.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            model_id_1: {
                                type: 'string',
                                description: 'The model ID of the first camera to compare.'
                            },
                            model_id_2: {
                                type: 'string',
                                description: 'The model ID of the second camera to compare.'
                            }
                        },
                        required: ['model_id_1', 'model_id_2']
                    }
                },
                {
                    name: 'search_trainer_wiki_rag',
                    description: 'Queries the Trainer Wiki logic for general settings, advice, and workflows via a RAG integration.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'A natural language search query for the wiki.'
                            }
                        },
                        required: ['query']
                    }
                },
                {
                    name: 'upsert_trainer_wiki_knowledge',
                    description: 'Upserts a list of product metadata and text chunks into the Pinecone Vector DB for RAG retrieval.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            products: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        text: { type: 'string' },
                                        metadata: { type: 'object', additionalProperties: true }
                                    },
                                    required: ['id', 'text']
                                }
                            }
                        },
                        required: ['products']
                    }
                }
            ]
        };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const db = getDb();

        try {
            if (name === 'get_product_specs') {
                const { model_id } = GetProductSpecsSchema.parse(args);

                const snapshot = await db.collection('products')
                    .where('model_id', '==', model_id)
                    .limit(1)
                    .get();
                if (snapshot.empty) {
                    return {
                        content: [{ type: 'text', text: `Product spec not found for model: ${model_id}` }],
                        isError: true,
                    };
                }

                const data = snapshot.docs[0].data();
                return {
                    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
                };
            }

            if (name === 'search_color_recipes') {
                const { sensor_type, style } = SearchColorRecipesSchema.parse(args || {});

                let query: FirebaseFirestore.Query = db.collection('color_recipes');
                if (sensor_type) {
                    query = query.where('compatible_sensors', 'array-contains', sensor_type);
                }
                // Note: Multiple fields depending on inequality might require a composite index on Firestore 
                // For 'style' it will be assumed an equality comparison mapped to 'base_film' or 'style'
                if (style) {
                    query = query.where('base_film', '==', style);
                }
                const snapshot = await query.get();
                const recipes = snapshot.docs.map(doc => doc.data());

                return {
                    content: [
                        {
                            type: 'text',
                            text: recipes.length > 0 ? JSON.stringify(recipes, null, 2) : 'No color recipes matched your criteria.'
                        }
                    ]
                };
            }

            if (name === 'compare_sony_cameras') {
                const { model_id_1, model_id_2 } = CompareSonyCamerasSchema.parse(args);

                const [snap1, snap2] = await Promise.all([
                    db.collection('products').where('model_id', '==', model_id_1).limit(1).get(),
                    db.collection('products').where('model_id', '==', model_id_2).limit(1).get()
                ]);

                const cam1 = snap1.empty ? null : snap1.docs[0].data();
                const cam2 = snap2.empty ? null : snap2.docs[0].data();

                if (!cam1 && !cam2) {
                    return {
                        content: [{ type: 'text', text: `Neither camera found in database: ${model_id_1}, ${model_id_2}` }],
                        isError: true,
                    };
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                camera_1: { model_id: model_id_1, specs: cam1 || 'Not Found' },
                                camera_2: { model_id: model_id_2, specs: cam2 || 'Not Found' }
                            }, null, 2)
                        }
                    ]
                };
            }

            if (name === 'search_trainer_wiki_rag') {
                const { query } = SearchTrainerWikiRagSchema.parse(args);

                if (!pineconeKey || !apiKey) {
                    return {
                        content: [{ type: 'text', text: "MCP Server Error: Missing Gemini or Pinecone keys." }],
                        isError: true
                    };
                }

                try {
                    const pc = new Pinecone({ apiKey: pineconeKey });
                    const index = pc.index(indexName);

                    const embeddingResult = await embeddingModel.embedContent(query);
                    const queryVector = embeddingResult.embedding.values.slice(0, 1024);

                    const queryResponse = await index.query({
                        vector: queryVector,
                        topK: 10,
                        includeMetadata: true
                    });

                    const matches = queryResponse.matches || [];
                    const context = matches.map((m: any) => m.metadata.text).join('\n\n---\n\n');

                    return {
                        content: [
                            {
                                type: 'text',
                                text: context || "No relevant knowledge found in the Trainer Wiki database."
                            }
                        ]
                    };
                } catch (ragErr: any) {
                    return {
                        content: [{ type: 'text', text: `RAG Retrieval Error: ${ragErr.message}` }],
                        isError: true
                    };
                }
            }

            if (name === 'upsert_trainer_wiki_knowledge') {
                const { products } = UpsertTrainerWikiKnowledgeSchema.parse(args);

                if (!pineconeKey || !apiKey) {
                    return {
                        content: [{ type: 'text', text: "MCP Server Error: Missing Gemini or Pinecone keys." }],
                        isError: true
                    };
                }

                try {
                    const pc = new Pinecone({ apiKey: pineconeKey });
                    const index = pc.index(indexName);

                    const vectorsToUpsert: any[] = [];
                    for (const prod of products) {
                        const embeddingResult = await embeddingModel.embedContent(prod.text);
                        const vectorValues = embeddingResult.embedding.values.slice(0, 1024);

                        vectorsToUpsert.push({
                            id: prod.id,
                            values: vectorValues,
                            metadata: {
                                ...prod.metadata,
                                text: prod.text,
                                lastUpdated: new Date().toISOString()
                            }
                        });
                    }

                    await index.upsert({ records: vectorsToUpsert });

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Successfully upserted ${vectorsToUpsert.length} vectors to Pinecone index: ${indexName}`
                            }
                        ]
                    };
                } catch (upsertErr: any) {
                    return {
                        content: [{ type: 'text', text: `Pinecone Upsert Error: ${upsertErr.message}` }],
                        isError: true
                    };
                }
            }

            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);

        } catch (error: any) {
            if (error instanceof Error && error.name === 'ZodError') {
                throw new McpError(ErrorCode.InvalidParams, `Invalid parameters: ${error.message}`);
            }
            if (error instanceof McpError) {
                throw error;
            }
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Database error: ${error.message}`
                    }
                ]
            };
        }
    });
};
