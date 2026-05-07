import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in .env file');
  }
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    },
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
    const text = await generateContent(prompt);
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found in response');
    const jsonStr = text.substring(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini API Error:', error.message || error);
    
    const errorMsg = error.message || '';
    if (error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
      throw { status: 429, message: 'Google Gemini API quota exceeded for this model/key. Please wait or try a different API key.' };
    }
    
    throw new Error('Failed to generate AI response. Please try again.');
  }
};
