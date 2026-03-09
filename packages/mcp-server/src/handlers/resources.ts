import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getDb } from '../firebase.js';

// Cache for product list to avoid excessive Firestore queries
let cachedProductList: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const registerResources = (server: Server) => {
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return {
            resources: [
                {
                    uri: 'sony://system/product-list',
                    name: 'Sony Product List',
                    description: 'A cached list of all available Sony camera model IDs and names in the database. Use this to know what valid inputs exist for get_product_specs.',
                    mimeType: 'application/json'
                },
                {
                    uri: 'sony://system/recipe-categories',
                    name: 'Color Recipe Categories',
                    description: 'A static list of available film simulation styles.',
                    mimeType: 'application/json'
                }
            ]
        };
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const uri = request.params.uri;

        if (uri === 'sony://system/product-list') {
            try {
                const now = Date.now();
                if (!cachedProductList || (now - lastCacheTime > CACHE_TTL)) {
                    const db = getDb();
                    // Select only necessary fields for a lightweight list
                    const snapshot = await db.collection('products').select('model_id', 'name').get();
                    const products = snapshot.docs.map(doc => doc.data());
                    cachedProductList = products;
                    lastCacheTime = now;
                }

                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(cachedProductList, null, 2)
                        }
                    ]
                };
            } catch (error: any) {
                throw new McpError(ErrorCode.InternalError, `Failed to fetch product list: ${error.message}`);
            }
        }

        if (uri === 'sony://system/recipe-categories') {
            // Static list of popular/supported base film styles
            const styles = [
                "Cinematic",
                "Vintage",
                "Kodak",
                "Fujifilm",
                "Black & White",
                "Portrait",
                "Landscape",
                "Moody"
            ];

            return {
                contents: [
                    {
                        uri,
                        mimeType: 'application/json',
                        text: JSON.stringify(styles, null, 2)
                    }
                ]
            };
        }

        throw new McpError(ErrorCode.InvalidRequest, `Unknown resource URI: ${uri}`);
    });
};
