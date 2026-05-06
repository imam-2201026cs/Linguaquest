import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of models to try in order of preference
const MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

async function getWorkingModel(genAI) {
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // We must actually try a call to see if it exists
      await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }], generationConfig: { maxOutputTokens: 1 } });
      console.log(`Successfully verified model: ${modelName}`);
      return modelName;
    } catch (e) {
      console.log(`Model ${modelName} not available or error: ${e.message}`);
    }
  }
  return "gemini-pro";
}

/**
 * Generate plain text content using Gemini
 */
export const generateContent = async (prompt) => {
  try {
    const modelName = await getWorkingModel(genAI);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generateContent Error:', error.message);
    throw error;
  }
};

/**
 * Generate JSON content using Gemini (Strict JSON mode)
 */
export const generateJSON = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY is missing!');
      throw new Error('API Configuration Missing');
    }

    const modelName = await getWorkingModel(genAI);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // 1.5 models support native JSON mode
    const is15 = modelName.includes('1.5');
    const generationConfig = is15 ? { responseMimeType: "application/json" } : {};
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: is15 ? prompt : prompt + "\n\nReturn ONLY raw JSON." }] }],
      generationConfig
    });

    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      const cleanJson = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (error) {
    console.error('GEMINI JSON ERROR:', error.message);
    throw error;
  }
};
