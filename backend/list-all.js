import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const listAllModels = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the native fetch to list models since the SDK might not expose it easily
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log('Available Models:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error listing models:', err);
  }
};

listAllModels();
