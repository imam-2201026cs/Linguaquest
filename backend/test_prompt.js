import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const generateJSON = async (prompt) => {
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
      model: 'llama-3.3-70b-versatile',
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

const topic = "Error Detection";
const TOPICS = [
  "Antonyms", "Synonyms", "Spelling Errors", "One Word Substitution", "Verbs", "Adverbs", "Tenses",
  "Subject-Verb Agreement", "Idioms & Phrases", "Agreement", "Articles", "Error Detection",
  "Preposition", "Conjunction",
  "Fill in the Blanks", "Sentence Correction", "Rearrangement", "Vocabulary", "Unseen Passage",
  "Narration (Direct & Indirect Speech)", "Active & Passive Voice"
];

let promptTopic = topic === 'Mixed' ? `a mixture of these topics: ${TOPICS.join(', ')}` : topic;

let patternInstruction = "";
if (topic === "Error Detection") {
  patternInstruction = `
  CRITICAL: For Error Detection, you MUST follow this EXACT format:
  1. Divide the 'question' into 4 parts with (1), (2), (3), (4) labels and slashes. End with "/ No Error (5)".
  2. The 'options' array MUST BE EXACTLY: ["Part (1)", "Part (2)", "Part (3)", "Part (4)", "No Error (5)"]
  3. The 'correct' index must be the 0-based index of the part containing the error (0 to 4).
  Example Question: "The English (1)/ defeated (2)/ french (3)/ in the battle of water loo (4)/ No Error (5)"
  Example Options: ["Part (1)", "Part (2)", "Part (3)", "Part (4)", "No Error (5)"]
  Example Correct: 2 (since 'french' should be 'French')
  `;
}

const prompt = `
  Generate a professional 5-question English Verbal Ability Test for the topic: "${promptTopic}".
  PATTERN: Competitive Exams (SSC, Banking, GRE style).
  RANDOM SEED: test_seed.
  
  ${patternInstruction}

  Requirements:
  1. EXACTLY 5 questions in the array.
  2. Unless specified otherwise, provide exactly 4 options (A, B, C, D).
  3. Format: Return ONLY a JSON object with a "questions" key.
  
  Format example:
  {
    "questions": [
      {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "..."
      }
    ]
  }
`;

async function test() {
  console.log("Testing Error Detection prompt...");
  const res = await generateJSON(prompt);
  console.log(JSON.stringify(res, null, 2));
}

test();
