import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiModel = (isJson = false) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured. Please add your key to the .env file.');
  }
  
  const config = {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
  };

  if (isJson) {
    config.responseMimeType = "application/json";
  }

  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: config,
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ]
  });
};

export const generateContent = async (prompt) => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generateContent Error:', error.message || error);
    const errorMsg = error.message || '';
    if (error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
      throw { status: 429, message: 'Gemini API quota exceeded. Please try again later.' };
    }
    throw error;
  }
};

export const generateJSON = async (prompt) => {
  try {
    const model = getGeminiModel(true); // Enable JSON mode
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Gemini JSON mode is very reliable, but we'll do a quick trim just in case
    return JSON.parse(text.trim());
  } catch (error) {
    console.error('Gemini JSON API Error:', error.message || error);
    
    const errorMsg = error.message || '';
    if (error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
      throw { status: 429, message: 'Google Gemini API quota exceeded. Please try again later.' };
    }
    
    throw new Error(error.message || 'Failed to generate AI response. Please check your API key.');
  }
};
