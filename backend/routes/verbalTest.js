import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/groq.js';

const router = express.Router();

const TOPICS = [
  "Antonyms", "Synonyms", "Spelling Errors", "One Word Substitution", "Verbs", "Adverbs", "Tenses",
  "Subject-Verb Agreement", "Idioms & Phrases", "Agreement", "Articles", "Error Detection",
  "Preposition", "Conjunction",
  "Fill in the Blanks", "Sentence Correction", "Rearrangement", "Vocabulary", "Unseen Passage",
  "Narration (Direct & Indirect Speech)", "Active & Passive Voice"
];

router.post('/generate', auth, async (req, res) => {
  const { topic } = req.body;
  
  try {
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

    // We'll ask for 20 questions.
    const randomSeed = Math.random().toString(36).substring(7);
    const prompt = `
      Generate a professional 20-question English Verbal Ability Test for the topic: "${promptTopic}".
      PATTERN: Competitive Exams (SSC, Banking, GRE style).
      RANDOM SEED: ${randomSeed}.
      
      ${patternInstruction}

      Requirements:
      1. EXACTLY 20 questions in the array.
      2. Provide exactly 4 distinct multiple-choice options for each question (unless it is Error Detection).
      3. CRITICAL: DO NOT include labels like "A)", "B.", or "1." inside the option strings.
      4. CRITICAL: DO NOT use single letters (like "A", "B", "C", "D") as the content of the options. Every option must be a valid word or phrase relevant to the topic.
      5. The "correct" field must be the 0-based index of the correct option in the "options" array (0 to 3).
      6. Format: Return ONLY a JSON object with a "questions" key.
      
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

    console.log(`[VerbalTest] Generating ${topic} with Groq AI (Llama 70B)...`);
    const result = await generateJSON(prompt, 'llama-3.3-70b-versatile');

    if (!result || !Array.isArray(result.questions)) {
      throw new Error('Invalid response format from AI');
    }

    res.json({
      topic,
      questions: result.questions.slice(0, 20)
    });
  } catch (err) {
    console.error('Verbal Test Generation Error:', err);
    res.status(500).json({ 
      message: 'Failed to generate test questions', 
      error: err.message
    });
  }
});

export default router;
