import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FaceBoundingBox } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function base64ToGenerativePart(data: string, mimeType: string) {
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
}

export async function detectFace(
  base64ImageData: string,
  mimeType: string
): Promise<FaceBoundingBox | null> {
  try {
    const imagePart = base64ToGenerativePart(base64ImageData, mimeType);
    const response = await ai.models.generateContent({
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
  } catch (error) {
    console.error("Error detecting face:", error);
    return null;
  }
}


export async function applyCracksWithAI(
  base64ImageData: string,
  mimeType: string,
  strength: number
): Promise<string | null> {
  try {
    const imagePart = base64ToGenerativePart(base64ImageData, mimeType);
    
    let intensity_description = "moderate, like dry earth";
    if (strength <= 33) {
      intensity_description = "subtle and fine, like delicate porcelain";
    } else if (strength >= 67) {
      intensity_description = "deep and extensive, like shattering stone";
    }

    const prompt = `Using the provided image, realistically edit the person's skin to look like it is cracking. The cracks should look natural and follow the contours of the face. The intensity of the cracking should be ${intensity_description}. Do not add any text or watermarks to the image.`;

    const response = await ai.models.generateContent({
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

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data; // Return the base64 string of the new image
      }
    }

    return null; // No image part found in the response
  } catch (error) {
    console.error("Error applying AI crack effect:", error);
    return null;
  }
}