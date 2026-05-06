import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const generateJSON = async (prompt, model = 'llama-3.1-8b-instant') => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional exam generator. Return ONLY raw JSON.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model,
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    let content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content.trim());
  } catch (error) {
    console.error('Groq generateJSON Error:', error.message || error);
    throw error;
  }
};

const topic = "Preposition";
const prompt = `
      Generate a professional 5-question English Verbal Ability Test for the topic: "${topic}".
      PATTERN: Competitive Exams (SSC, Banking, GRE style).
      RANDOM SEED: test_seed_prep.
      
      Requirements:
      1. EXACTLY 5 questions in the array.
      2. Provide exactly 4 distinct multiple-choice options for each question (unless it is Error Detection).
      3. CRITICAL: DO NOT include labels like "A)", "B.", or "1." inside the option strings. Just the answer text.
      4. The "correct" field must be the 0-based index of the correct option in the "options" array.
      5. Format: Return ONLY a JSON object with a "questions" key.
      
      Format example:
      {
        "questions": [
          {
            "question": "The book is __________ the table.",
            "options": ["on", "at", "in", "by"],
            "correct": 0,
            "explanation": "We use 'on' for surfaces."
          }
        ]
      }
`;

async function test() {
  console.log("Testing Preposition prompt...");
  const res = await generateJSON(prompt, 'llama-3.3-70b-versatile');
  console.log(JSON.stringify(res, null, 2));
}

test();
