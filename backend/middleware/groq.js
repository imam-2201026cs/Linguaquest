import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
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
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3072,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq generateContent Error:', error.message || error);
    throw error;
  }
};

export const generateJSON = async (prompt, model = 'llama-3.3-70b-versatile') => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional, high-precision AI content generator. Return ONLY raw, valid JSON. NO markdown. NO explanations outside JSON. NO single-letter placeholders (like "A", "B") in options—generate real content.'
        },
        {
          role: 'user',
          content: prompt + "\n\nCRITICAL: Return ONLY raw JSON. Ensure all fields are populated with high-quality English content. Do not use placeholders.",
        },
      ],
      model: model,
      temperature: 0.1,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    });

    let content = completion.choices[0]?.message?.content || '{}';
    
    // Cleanup if model returns markdown despite instruction
    content = content.replace(/```json\n?|```/g, '').trim();
    
    try {
      return JSON.parse(content);
    } catch (parseErr) {
      console.warn('Groq JSON Parse Retry:', parseErr.message);
      // Try to find the first { and last } if parsing failed
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(content.substring(start, end + 1));
      }
      throw parseErr;
    }
  } catch (error) {
    console.error('Groq generateJSON Error:', error.message || error);
    
    // Smart Fallback: If 70b fails (likely rate limit), try 8b instant with a simpler prompt
    if (model !== 'llama-3.1-8b-instant') {
      console.log('Attempting fallback to 8b model...');
      try {
        return await generateJSON(prompt, 'llama-3.1-8b-instant');
      } catch (fallbackErr) {
        console.error('Groq Fallback Error:', fallbackErr.message);
      }
    }
    
    throw new Error('Failed to generate AI analysis');
  }
};
