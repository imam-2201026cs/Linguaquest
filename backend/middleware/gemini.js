import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate plain text content using Gemini
 */
export const generateContent = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generateContent Error:', error.message);
    throw error;
  }
};

/**
 * Generate JSON content using Gemini 1.5 Flash (Strict JSON mode)
 */
export const generateJSON = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY is missing!');
      throw new Error('API Configuration Missing');
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error('Gemini JSON Parse Error. Text received:', text.substring(0, 100) + '...');
      // Fallback: try to extract JSON if model added markdown
      const cleanJson = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (error) {
    console.error('GEMINI JSON ERROR:', error.message);
    throw error;
  }
};
