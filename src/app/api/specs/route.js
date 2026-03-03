import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export async function POST(request) {
    try {
        const { productName, productType } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY || "";

        if (!apiKey) {
            return NextResponse.json({ error: "No API Key provided." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const cameraSchema = {
            type: SchemaType.OBJECT,
            properties: {
                sensor: { type: SchemaType.STRING, description: "Sensor resolution and type, e.g., '33.0 MP Full-Frame Exmor R CMOS'" },
                processor: { type: SchemaType.STRING, description: "Image processor, e.g., 'BIONZ XR'" },
                video: { type: SchemaType.STRING, description: "Max video capability, e.g., '4K 120p / 10-bit 4:2:2'" },
                autofocus: { type: SchemaType.STRING, description: "Autofocus tech, e.g., '759-point Phase Detection with AI'" },
                viewfinder: { type: SchemaType.STRING, description: "EVF details, e.g., '9.44m-Dot EVF'" },
                weight: { type: SchemaType.STRING, description: "Weight in grams, e.g., '723g'" },
                estimatedPrice: { type: SchemaType.NUMBER, description: "Current estimated market price in VND (Numbers only), e.g., 85000000. Use 0 if unknown." },
                feature1: { type: SchemaType.STRING, description: "Unique key feature 1" },
                feature2: { type: SchemaType.STRING, description: "Unique key feature 2" }
            },
            required: ["sensor", "processor", "video", "autofocus", "viewfinder", "weight", "estimatedPrice", "feature1", "feature2"]
        };

        const lensSchema = {
            type: SchemaType.OBJECT,
            properties: {
                focalLength: { type: SchemaType.STRING, description: "Focal length, e.g., '24-70mm'" },
                aperture: { type: SchemaType.STRING, description: "Aperture range, e.g., 'f/2.8 to f/22'" },
                mount: { type: SchemaType.STRING, description: "Mount type, e.g., 'Sony E-Mount (Full-Frame)'" },
                minFocus: { type: SchemaType.STRING, description: "Minimum focus distance, e.g., '21 cm'" },
                filterThread: { type: SchemaType.STRING, description: "Filter thread size, e.g., '82 mm'" },
                weight: { type: SchemaType.STRING, description: "Weight in grams, e.g., '695g'" },
                estimatedPrice: { type: SchemaType.NUMBER, description: "Current estimated market price in VND (Numbers only), e.g., 45000000. Use 0 if unknown." },
                feature1: { type: SchemaType.STRING, description: "Optical or build feature 1" },
                feature2: { type: SchemaType.STRING, description: "Optical or build feature 2" }
            },
            required: ["focalLength", "aperture", "mount", "minFocus", "filterThread", "weight", "estimatedPrice", "feature1", "feature2"]
        };

        const targetSchema = productType === 'camera' ? cameraSchema : lensSchema;

        const geminiModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: targetSchema,
                temperature: 0.1
            }
        });

        const sysPrompt = `You are a highly detailed and rigorously accurate Technical Representative for Sony Alpha. 
        Provide the exact technical specifications for the requested Sony ${productType}.
        Ensure the data is accurate to the official Sony spec sheets. Keep descriptions brief and professional.`;

        const userPrompt = `Product: ${productName}`;

        const result = await geminiModel.generateContent([sysPrompt, userPrompt]);
        const responseText = result.response.text();

        let jsonRes;
        try {
            jsonRes = JSON.parse(responseText);
        } catch (e) {
            jsonRes = { error: "Failed to parse spec JSON", raw: responseText };
        }

        return NextResponse.json(jsonRes);

    } catch (error) {
        console.error("Specs API Error: ", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
