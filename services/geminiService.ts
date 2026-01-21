
import { GoogleGenAI, Type } from "@google/genai";
import { ModelTier, StylingPreset } from "../types";

const FASHION_CLONE_BRAIN_PROMPT = `
# FashionClone Agent - System Instruction
You are **FashionClone AI** by **Creative Biz**, a professional fashion AI agent...
`;

const DUMMY_EXTRACTION_PROMPT = `
# ENTERPRISE-GRADE FASHION AI AGENT: DRESS-TO-DUMMY PROTOCOL

## PRIMARY OBJECTIVE:
Transform a dress worn by a human into a realistic studio mannequin presentation while preserving 100% design accuracy. This is a commercial fashion reconstruction task.

## STEP 1: GARMENT EXTRACTION (CRITICAL)
Extract ONLY the clothing item from the uploaded image.
- Completely remove the human model (face, body, hands, skin).
- Do NOT invent or modify any clothing parts.
- Preserve exact: Fabric texture, color tone, embroidery position, borders, patterns, saree pleats/pallu flow, blouse cut, sleeve length, neckline.
- Maintain original garment geometry and proportions.

## STEP 2: GARMENT GEOMETRY LOCK
After extraction, LOCK the garment.
- STRICT RULES: No resizing, no stretching, no slimming or widening, no repositioning embroidery, no color correction, no redesign.
- The garment must remain IDENTICAL to the original.

## STEP 3: MANNEQUIN APPLICATION
Apply the locked garment onto a mannequin.
- Neutral studio mannequin: faceless, hairless, expressionless, symmetric posture.
- CRITICAL INSTRUCTION: The MANNEQUIN must adapt to the GARMENT. The GARMENT must NEVER adapt to the mannequin.

## VISUAL QUALITY RULES:
- Ultra-realistic 4K/8K quality.
- Professional fashion studio lighting.
- E-commerce catalog standard.
- Sharp focus, natural shadows, realistic fabric folds.

## ABSOLUTE RESTRICTIONS:
- DO NOT: Change dress design, change colors, add accessories, add jewelry, add text or logos, beautify or stylize.
- Hallucinate NO missing details.

## NEGATIVE PROMPT:
different dress, altered design, wrong drape, distorted fabric, stretched saree, changed embroidery, extra folds, missing pleats, fake texture, bad anatomy, human face, hands visible, blur, low quality, watermark, logo, text.

## FINAL OUTPUT RULE:
Return ONLY the final mannequin image. No explanation. No captions. No markdown. No additional text.
`;

export const getSupportResponse = async (userMessage: string, chatHistory: {role: 'user' | 'model', text: string}[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SUPPORT_AGENT_INSTRUCTION,
    }
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text || "দুঃখিত, একটু টেকনিক্যাল সমস্যা হচ্ছে। আমি লাবনী আক্তার, আবার চেষ্টা করলে ভালো হয়।";
};

export const extractDressToDummy = async (image: string, style: string): Promise<string> => {
  // Use a fresh instance with potential user-selected key for Pro model
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: ModelTier.IMAGE_PRO, // Upgraded to Pro for 4K quality as requested
    contents: {
      parts: [
        { inlineData: { data: image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: `${DUMMY_EXTRACTION_PROMPT}\n\nACTION: Apply the locked garment to a high-end ${style} studio mannequin.` }
      ]
    },
    config: {
      temperature: 0.0,
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "4K" // Maximum enterprise quality
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Dummy synthesis failed. Ensure the image clearly shows the full garment.");
};

export const analyzeFashionContext = async (
  refModel: string,
  prodDress: string,
  bgImage: string | null,
  preset: StylingPreset,
  brandContext: string
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const contents = [
    { text: FASHION_CLONE_BRAIN_PROMPT },
    { inlineData: { data: refModel.split(',')[1], mimeType: 'image/jpeg' } },
    { inlineData: { data: prodDress.split(',')[1], mimeType: 'image/jpeg' } },
    ...(bgImage ? [{ inlineData: { data: bgImage.split(',')[1], mimeType: 'image/jpeg' } }] : []),
    { text: `STYLING_PRESET: ${preset}\nBRAND_CONTEXT: ${brandContext}` }
  ];
  const response = await ai.models.generateContent({
    model: ModelTier.FLASH,
    contents: { parts: contents },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
};

export const generateFashionImage = async (
  analysisData: any,
  refModel: string,
  prodDress: string,
  tier: ModelTier = ModelTier.IMAGE_GEN
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const synthesisPrompt = `
    TASK: PRECISION RECONSTRUCTION
    IDENTITY LOCK: ${analysisData.character_description}
    GARMENT LOCK: ${analysisData.dress_description}
    STYLING: ${analysisData.styling_instruction}
    ENVIRONMENT: ${analysisData.background_instruction}
    Maintain exact face and outfit details.
  `;
  const response = await ai.models.generateContent({
    model: tier,
    contents: {
      parts: [
        { inlineData: { data: refModel.split(',')[1], mimeType: 'image/jpeg' } },
        { inlineData: { data: prodDress.split(',')[1], mimeType: 'image/jpeg' } },
        { text: synthesisPrompt }
      ]
    },
    config: { temperature: 0.05, imageConfig: { aspectRatio: "3:4" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Synthesis engine returned no image data.");
};

export const generateFashionVideo = async (
  analysisData: any,
  refModel: string,
  onProgress: (msg: string) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    onProgress("Initializing Cinematic Frame Buffer...");
    let operation = await ai.models.generateVideos({
      model: ModelTier.VIDEO_GEN,
      prompt: `Cinematic fashion commercial for Creative Biz. Character: ${analysisData.character_description}. Dress: ${analysisData.dress_description}.`,
      image: { imageBytes: refModel.split(',')[1], mimeType: 'image/jpeg' },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      onProgress("Synthesizing Neural Frames...");
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const fetchResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await fetchResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error) { throw error; }
};

const SUPPORT_AGENT_INSTRUCTION = `
You are Laboni Akter (লাবনী আক্তার), the professional and friendly Support Agent for Creative Biz.
Your personality is warm, helpful, and sophisticated.
You speak ONLY in natural, fluent Bengali (Bangla).
`;
