import { z } from 'zod';

// --- Firestore Document Interfaces ---

export interface ProductDocument {
    model_id: string;
    name: string;
    type: string; // e.g., 'camera', 'lens'
    sensor_type: string;
    release_year: number;
    key_features: string[];
}

export interface ColorRecipeDocument {
    recipe_id: string;
    name: string;
    base_film: string;
    dynamic_range: string;
    white_balance: string;
    compatible_sensors: string[];
}

// --- Zod Schemas for Tool Inputs ---

// Tool: get_product_specs
export const GetProductSpecsSchema = z.object({
    model_id: z.string().describe('The strict alphanumeric model ID of the Sony product (e.g., A7M4, FX3).')
});
export type GetProductSpecsInput = z.infer<typeof GetProductSpecsSchema>;

// Tool: search_color_recipes
export const SearchColorRecipesSchema = z.object({
    sensor_type: z.string().optional().describe('The camera sensor generation or type (e.g., Exmor R, BSI-CMOS).'),
    style: z.string().optional().describe('The desired visual style or base film character (e.g., Cinematic, Vintage, Kodak).')
});
export type SearchColorRecipesInput = z.infer<typeof SearchColorRecipesSchema>;

// Tool: compare_sony_cameras
export const CompareSonyCamerasSchema = z.object({
    model_id_1: z.string().describe('The model ID of the first camera to compare.'),
    model_id_2: z.string().describe('The model ID of the second camera to compare.')
});
export type CompareSonyCamerasInput = z.infer<typeof CompareSonyCamerasSchema>;

// Tool: search_trainer_wiki_rag
export const SearchTrainerWikiRagSchema = z.object({
    query: z.string().describe('A natural language query regarding Sony products, settings, workflows, or training materials.')
});
export type SearchTrainerWikiRagInput = z.infer<typeof SearchTrainerWikiRagSchema>;

// Tool: upsert_trainer_wiki_knowledge
export const UpsertTrainerWikiKnowledgeSchema = z.object({
    products: z.array(z.object({
        id: z.string(),
        text: z.string(),
        metadata: z.record(z.any()).optional()
    }))
});
export type UpsertTrainerWikiKnowledgeInput = z.infer<typeof UpsertTrainerWikiKnowledgeSchema>;
