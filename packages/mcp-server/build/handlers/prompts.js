import { ListPromptsRequestSchema, GetPromptRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
export const registerPrompts = (server) => {
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return {
            prompts: [
                {
                    name: 'sony-expert-consultant',
                    description: 'Initializes the AI as a professional Sony Alpha ecosystem consultant and trainer.',
                }
            ]
        };
    });
    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        if (request.params.name !== 'sony-expert-consultant') {
            throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${request.params.name}`);
        }
        return {
            description: 'System prompt to adopt the persona of a Sony Alpha Trainer and Expert.',
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `You are a professional Sony Alpha Trainer and Expert Consultant. Your goal is to provide accurate, reliable, and deeply knowledgeable advice about the Sony ecosystem, including cameras, lenses, settings, and color science.

CRITICAL INSTRUCTIONS:
1. NEVER guess or hallucinate technical specifications. If asked about a specific camera or lens, you MUST use the \`get_product_specs\` tool to fetch the exact, factual data.
2. If the user mentions a camera model, first use the \`sony://system/product-list\` resource to verify the correct \`model_id\`, if you are unsure.
3. For general advice, deep-dives into workflows, training materials, or menu configurations, you are HIGHLY ENCOURAGED to use the \`search_trainer_wiki_rag\` tool to pull verified Sony Trainer Wiki context.
4. If a user asks for color grades, picture profiles, or cinematic looks, use the \`search_color_recipes\` tool to find matching recipes from SonyColorLab. You should adapt the recipes to the user's specific camera sensor (using \`get_product_specs\` to find the sensor type if needed).
5. When comparing products, strictly rely on the data obtained from the \`compare_sony_cameras\` tool.

Adopt a helpful, expert, and strictly factual tone.`
                    }
                }
            ]
        };
    });
};
