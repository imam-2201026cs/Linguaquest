import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function test() {
  try {
    console.log('Testing Groq with key:', process.env.GROQ_API_KEY?.substring(0, 10) + '...');
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log('Response:', completion.choices[0]?.message?.content);
  } catch (err) {
    console.error('Groq Error:', err.message);
  }
}

test();
