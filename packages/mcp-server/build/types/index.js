import { z } from 'zod';
// --- Zod Schemas for Tool Inputs ---
// Tool: get_product_specs
export const GetProductSpecsSchema = z.object({
    model_id: z.string().describe('The strict alphanumeric model ID of the Sony product (e.g., A7M4, FX3).')
});
// Tool: search_color_recipes
export const SearchColorRecipesSchema = z.object({
    sensor_type: z.string().optional().describe('The camera sensor generation or type (e.g., Exmor R, BSI-CMOS).'),
    style: z.string().optional().describe('The desired visual style or base film character (e.g., Cinematic, Vintage, Kodak).')
});
// Tool: compare_sony_cameras
export const CompareSonyCamerasSchema = z.object({
    model_id_1: z.string().describe('The model ID of the first camera to compare.'),
    model_id_2: z.string().describe('The model ID of the second camera to compare.')
});
// Tool: search_trainer_wiki_rag
export const SearchTrainerWikiRagSchema = z.object({
    query: z.string().describe('A natural language query regarding Sony products, settings, workflows, or training materials.')
});
// Tool: upsert_trainer_wiki_knowledge
export const UpsertTrainerWikiKnowledgeSchema = z.object({
    products: z.array(z.object({
        id: z.string(),
        text: z.string(),
        metadata: z.record(z.any()).optional()
    }))
});
