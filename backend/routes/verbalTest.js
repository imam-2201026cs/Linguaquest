import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/gemini.js';

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
      4. EXPLANATION: Provide a detailed explanation of why that specific part is grammatically incorrect.
      `;
    }

    const seed = Math.random().toString(36).substring(7);
    const prompt = `
      Generate a professional 30-question English Verbal Ability Test for: "${promptTopic}".
      PATTERN: Competitive Exams.
      SEED: ${seed}.
      ${patternInstruction}

      Requirements:
      1. EXACTLY 30 questions in a flat array called "questions".
      2. 4 distinct options per question.
      3. NO "A)", "B)" labels in options.
      4. NO single-letter placeholders.
      5. Provide clear, detailed explanations for every question.
      6. Return ONLY a JSON object with a "questions" key.
    `;

    console.log(`[VerbalTest] Generating 30 questions for ${topic} with Gemini 1.5 Flash...`);
    const result = await generateJSON(prompt);

    if (!result || !Array.isArray(result.questions)) {
      throw new Error('Invalid response format from AI');
    }

    res.json({
      topic,
      questions: result.questions.slice(0, 30)
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
