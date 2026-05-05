import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY
});

export const generateContent = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Reliable high-quality model on Groq
      temperature: 0.7,
      max_tokens: 3072,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq generateContent Error:', error.message || error);
    throw error;
  }
};

export const generateJSON = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that only responds in JSON format.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0]?.message?.content || '{}');
  } catch (error) {
    console.error('Groq generateJSON Error:', error.message || error);
    // Fallback parsing if JSON mode fails or returns weirdness
    try {
      const text = await generateContent(prompt + " (Respond ONLY with raw JSON)");
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(text.substring(start, end + 1));
      }
    } catch (e) {
      console.error('Groq Fallback JSON Error:', e.message);
    }
    throw new Error('Failed to generate AI analysis');
  }
};
