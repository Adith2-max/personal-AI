import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const geminiFlash = 'gemini-2.5-flash';
const imagen = 'imagen-3.0-generate-002';


export const streamChat = (
    history: Content[],
    prompt: string,
    imagePart: Part | null,
    useWebSearch: boolean,
    model: string
) => {
    const config: any = useWebSearch ? { tools: [{ googleSearch: {} }] } : {};

    // For fast answers, disable thinking on the flash model.
    if (model === geminiFlash) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }

    const chat = ai.chats.create({
        model: model,
        history: history,
        config: config,
    });

    const currentPromptParts: Part[] = [{ text: prompt }];
    if (imagePart) {
        currentPromptParts.unshift(imagePart);
    }

    return chat.sendMessageStream({
        message: currentPromptParts,
    });
};


export const generateImage = async (prompt: string) => {
    const response = await ai.models.generateImages({
        model: imagen,
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("Image generation failed.");
};

export const groundedSearch = async (query: string): Promise<GenerateContentResponse> => {
    return await ai.models.generateContent({
        model: geminiFlash,
        contents: query,
        config: {
            tools: [{ googleSearch: {} }],
            // Disable thinking for faster grounded search responses.
            thinkingConfig: { thinkingBudget: 0 },
        },
    });
};