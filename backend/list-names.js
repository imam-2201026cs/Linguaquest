import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const listNames = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    if (data.models) {
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log('No models found or error:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

listNames();
