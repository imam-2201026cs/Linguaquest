import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/openrouter.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { updateStreak } from '../middleware/streak.js';

const router = express.Router();

router.post('/check', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 5)
      return res.status(400).json({ message: 'Please provide some text to check.' });

    const prompt = `You are an expert English grammar checker. Analyze this text for grammar mistakes:

"${text}"

Provide a detailed evaluation in JSON format with these exact fields:
{
  "hasErrors": <true/false>,
  "overallScore": <0-100, grammar quality score>,
  "correctedText": "<fully corrected version>",
  "errors": [
    {
      "type": "<Grammar/Spelling/Punctuation/Style>",
      "original": "<wrong phrase>",
      "correction": "<correct phrase>",
      "explanation": "<brief explanation of the rule>",
      "ruleExamples": ["<correct example 1>", "<correct example 2>", "<correct example 3>"],
      "severity": "<high/medium/low>"
    }
  ],
  "tips": ["<grammar tip 1>", "<grammar tip 2>"],
  "analysis": {
    "sentenceCount": <number>,
    "wordCount": <number>,
    "avgSentenceLength": <number>,
    "readabilityLevel": "<Basic/Intermediate/Advanced>"
  }
}
Return ONLY the JSON.`;

    const result = await generateJSON(prompt);

    const xpEarned = 5 + (result.overallScore > 80 ? 10 : 5);
    const coinsEarned = 3;

    const activity = new Activity({
      userId: req.user._id,
      type: 'grammar',
      topic: 'Grammar Check',
      score: result.overallScore,
      maxScore: 100,
      xpEarned,
      coinsEarned,
      details: result
    });
    await activity.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { xp: xpEarned, coins: coinsEarned, 'stats.grammarChecked': 1 }
    });
    await updateStreak(req.user._id);

    res.json({ ...result, xpEarned, coinsEarned });
  } catch (err) {
    console.error('Grammar Check Error:', err);
    res.status(err.status === 429 ? 429 : 500).json({ 
      message: err.message === 'Failed to generate or parse response' ? 'Analysis failed, try again.' : err.message || 'Analysis failed, try again.' 
    });
  }
});

router.post('/quiz/generate', auth, async (req, res) => {
  try {
    const { level = 'intermediate' } = req.body;

    const prompt = `Create a grammar quiz for ${level} English learners.

Return ONLY JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "<fill in the blank or choose correct sentence>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "correct": 0,
      "explanation": "<grammar rule explanation>",
      "hint": "<a helpful hint without giving away the exact answer>",
      "topic": "<Tense/Articles/Prepositions/etc>"
    }
  ]
}
Include exactly 5 questions covering different grammar topics. Return ONLY the JSON.`;

    const quiz = await generateJSON(prompt);
    res.json(quiz);
  } catch (err) {
    console.error('Quiz Generation Error:', err);
    res.status(500).json({ message: 'Quiz generation failed' });
  }
});

export default router;
