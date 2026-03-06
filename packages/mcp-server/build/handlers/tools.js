import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getDb } from '../firebase.js';
import { GetProductSpecsSchema, SearchColorRecipesSchema, CompareSonyCamerasSchema, SearchTrainerWikiRagSchema } from '../types/index.js';
export const registerTools = (server) => {
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
                let query = db.collection('color_recipes');
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
                // Return a placeholder for the mock result
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Mock RAG result for: \n${query}`
                        }
                    ]
                };
            }
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        catch (error) {
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
