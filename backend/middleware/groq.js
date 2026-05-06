import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const generateContent = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3072,
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq Content Error:', error.message);
    throw error;
  }
};

export const generateJSON = async (prompt, model = 'llama-3.3-70b-versatile') => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('CRITICAL: GROQ_API_KEY is missing from environment variables!');
      throw new Error('API Configuration Missing');
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional AI that returns ONLY raw JSON. No conversational text. No markdown blocks.'
        },
        {
          role: 'user',
          content: prompt
        },
      ],
      model: model,
      temperature: 0.1,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    });

    let content = completion.choices[0]?.message?.content || '{}';
    
    // Extreme cleanup: remove markdown and find the first '{' and last '}'
    content = content.replace(/```json\n?|```/g, '').trim();
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      content = content.substring(start, end + 1);
    }

    try {
      return JSON.parse(content);
    } catch (parseErr) {
      console.error('JSON Parse Error. Content received:', content.substring(0, 100) + '...');
      throw new Error('AI returned malformed data');
    }
  } catch (error) {
    console.error('GROQ JSON ERROR:', error.message);
    
    // Final fallback to 8b if 70b hits rate limits or timeouts
    if (model !== 'llama-3.1-8b-instant') {
      console.log('--- Falling back to 8b model for stability ---');
      return await generateJSON(prompt, 'llama-3.1-8b-instant');
    }
    
    throw error;
  }
};
