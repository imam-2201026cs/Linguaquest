import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function test() {
  try {
    console.log('Testing Groq JSON mode with llama-3.3-70b-versatile...');
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Return ONLY JSON.' },
        { role: 'user', content: 'Generate a 1-question quiz about grammar.' }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });
    console.log('Response:', completion.choices[0]?.message?.content);
  } catch (err) {
    console.error('Groq Error:', err.message);
  }
}

test();
