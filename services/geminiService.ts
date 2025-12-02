import { GoogleGenAI } from "@google/genai";

// ============================================================================
// AI TUTOR SERVICE (GOOGLE GENAI BACKEND)
// ============================================================================
// Refactored to use Google Gemini API as requested.
// ============================================================================

export const getAITutorResponse = async (prompt: string): Promise<string> => {
  // API Key must be obtained exclusively from the environment variable process.env.API_KEY
  if (!process.env.API_KEY) {
    return "⚠️ Configuration Missing: Please add your API Key in .env";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-2.5-flash for basic text tasks (tutor) as per guidelines.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful, encouraging, and smart AI Help Assistant for a high school student at Presidency Academy. Keep answers concise, educational, and friendly. Use emojis occasionally.",
      },
    });

    return response.text || "I couldn't generate a response. Please try again.";

  } catch (error) {
    console.error("AI Service Error", error);
    return "I'm having trouble connecting to the AI Help Assistant right now. Please check your internet connection or API key quota.";
  }
};