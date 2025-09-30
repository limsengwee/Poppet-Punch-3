import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FaceBoundingBox } from '../types';

let ai: GoogleGenAI | null = null;

// Fix: Use `process.env.API_KEY` for the API key as per coding guidelines.
// This also resolves the TypeScript error on `import.meta.env`.
const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // This error will be caught by App.tsx and displayed in the UI.
      throw new Error("Gemini API key not found. Please create a .env.local file and set VITE_GEMINI_API_KEY='YOUR_API_KEY'. Then, restart the server or rebuild the application.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

function base64ToGenerativePart(data: string, mimeType: string) {
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
}

export async function applyGenerativeImageEffect(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string | null> {
    const aiClient = getAiClient();
    const imagePart = base64ToGenerativePart(base64ImageData, mimeType);
    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                imagePart,
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const candidate = response?.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    return null;
}

export async function detectFace(
  base64ImageData: string,
  mimeType: string
): Promise<FaceBoundingBox | null> {
  const aiClient = getAiClient();
  const imagePart = base64ToGenerativePart(base64ImageData, mimeType);
  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        imagePart,
        {
          text: "Analyze this image and provide the bounding box coordinates of the primary human face. The origin (0,0) is the top-left corner. Respond only with a JSON object. The coordinates and dimensions should be percentages of the image's total width and height.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          x: {
            type: Type.NUMBER,
            description:
              "The x-coordinate of the top-left corner of the bounding box, as a percentage of the image width.",
          },
          y: {
            type: Type.NUMBER,
            description:
              "The y-coordinate of the top-left corner of the bounding box, as a percentage of the image height.",
          },
          width: {
            type: Type.NUMBER,
            description: "The width of the bounding box, as a percentage of the image width.",
          },
          height: {
            type: Type.NUMBER,
            description: "The height of the bounding box, as a percentage of the image height.",
          },
        },
      },
    },
  });

  const jsonString = response.text.trim();
  const data = JSON.parse(jsonString);
  
  if (data && typeof data.x === 'number' && typeof data.y === 'number' && typeof data.width === 'number' && typeof data.height === 'number') {
    // It's ambiguous if the model returns 0-1 or 0-100 for percentages.
    // Normalize to be safe by detecting if any value is > 1.
    const isPercentRange = data.x > 1 || data.y > 1 || data.width > 1 || data.height > 1;
    const divisor = isPercentRange ? 100 : 1;

    const box: FaceBoundingBox = {
      x: data.x / divisor,
      y: data.y / divisor,
      width: data.width / divisor,
      height: data.height / divisor,
    };

    // Sanity check that the box is valid before returning it.
    if (box.x >= 0 && box.y >= 0 && box.width > 0 && box.height > 0 && (box.x + box.width) <= 1.05 && (box.y + box.height) <= 1.05) {
        return box;
    }
  }

  return null;
}