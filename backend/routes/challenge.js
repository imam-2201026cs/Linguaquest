import express from 'express';
import auth from '../middleware/auth.js';
import { DailyChallenge, ChallengeSubmission } from '../models/DailyChallenge.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const getTodayString = () => {
  // Use Asia/Kolkata timezone to ensure it rolls over at the user's midnight (IST)
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// GET today's challenge
router.get('/daily', auth, async (req, res) => {
  try {
    const today = getTodayString();
    
    // Check if user already submitted
    const submission = await ChallengeSubmission.findOne({ userId: req.user._id, dateString: today });
    
    // Find today's challenge
    let challenge = await DailyChallenge.findOne({ dateString: today });
    
    // If no challenge exists for today, GENERATE IT!
    if (!challenge) {
      console.log('Generating new Daily Challenge for', today);
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Ensure we use the stable model to avoid rate limits
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are an expert English teacher. Create a 10-question Daily Challenge Quiz.
        The quiz should mix Grammar, Vocabulary, and Idioms.
        Difficulty should be intermediate (B1-B2 level).
        Return ONLY a JSON array of 10 question objects.
        Format:
        [
          {
            "question": "What is the correct past tense of 'go'?",
            "options": ["goed", "went", "gone", "going"],
            "correct": 1, // index of correct option
            "explanation": "'Went' is the irregular past tense of the verb 'to go'."
          }
        ]
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const questions = JSON.parse(text);
      
      challenge = new DailyChallenge({
        dateString: today,
        questions
      });
      await challenge.save();
    }
    
    // Strip correct answers if user hasn't submitted yet
    let responseData = challenge.toObject();
    if (!submission) {
      responseData.questions = responseData.questions.map(q => {
        delete q.correct;
        delete q.explanation;
        return q;
      });
    }

    res.json({
      challenge: responseData,
      submission
    });
  } catch (err) {
    console.error('Challenge error:', err);
    res.status(500).json({ message: 'Failed to fetch daily challenge', error: err.message });
  }
});

// Submit challenge
router.post('/submit', auth, async (req, res) => {
  try {
    const { answers, questionsAnswered } = req.body; // questionsAnswered should be 5 or 10
    const today = getTodayString();
    
    const existing = await ChallengeSubmission.findOne({ userId: req.user._id, dateString: today });
    if (existing) return res.status(400).json({ message: 'Already completed today.' });

    const challenge = await DailyChallenge.findOne({ dateString: today });
    if (!challenge) return res.status(404).json({ message: 'Challenge not found.' });

    let correctCount = 0;
    const providedAnswers = Object.values(answers);
    
    // Check answers (only up to questionsAnswered)
    for (let i = 0; i < questionsAnswered; i++) {
      if (answers[i] === challenge.questions[i].correct) {
        correctCount++;
      }
    }

    const scorePercentage = Math.round((correctCount / questionsAnswered) * 100);
    const xpEarned = correctCount * 10 * 2; // DOUBLE XP: 10 XP per correct * 2

    // Save submission
    const submission = new ChallengeSubmission({
      userId: req.user._id,
      challengeId: challenge._id,
      dateString: today,
      score: scorePercentage,
      questionsAnswered
    });
    await submission.save();

    // Update Global Challenge Stats
    challenge.totalCompletions += 1;
    if (questionsAnswered === 10) challenge.totalStage2Completions += 1;
    
    // Recalculate average score
    const totalScorePool = (challenge.averageScore * (challenge.totalCompletions - 1)) + scorePercentage;
    challenge.averageScore = totalScorePool / challenge.totalCompletions;
    await challenge.save();

    // Give rewards to user
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.coins += Math.floor(xpEarned / 5);
    await user.save();

    // Log Activity
    const activity = new Activity({
      userId: req.user._id,
      type: 'grammar', // Challenge falls under grammar/general
      topic: `Daily Challenge (${questionsAnswered} Qs)`,
      score: scorePercentage,
      xpEarned
    });
    await activity.save();

    res.json({
      score: scorePercentage,
      correct: correctCount,
      total: questionsAnswered,
      xpEarned,
      coinsEarned: Math.floor(xpEarned / 5),
      globalStats: {
        totalCompletions: challenge.totalCompletions,
        totalStage2Completions: challenge.totalStage2Completions,
        averageScore: Math.round(challenge.averageScore)
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
