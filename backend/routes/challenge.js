import express from 'express';
import auth from '../middleware/auth.js';
import { DailyChallenge, ChallengeSubmission } from '../models/DailyChallenge.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { generateJSON } from '../middleware/groq.js';

const router = express.Router();

const getTodayString = () => {
  // We want a consistent date string based on IST (UTC+5:30)
  // This ensures all users see the same challenge for the same day.
  const now = new Date();
  const istOffset = 330 * 60 * 1000; // 5 hours 30 mins in milliseconds
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
};

// GET today's challenge
router.get('/daily', auth, async (req, res) => {
  try {
    const today = getTodayString();
    console.log(`[DailyChallenge] Fetching for ${today}`);
    
    // Check if user already submitted
    const submission = await ChallengeSubmission.findOne({ userId: req.user._id, dateString: today });
    
    // Find today's challenge
    let challenge = await DailyChallenge.findOne({ dateString: today });
    
    // If no challenge exists for today, GENERATE IT!
    if (!challenge) {
      // Pick a hidden topic to force AI variety
      const topics = [
        "Mixed Tenses", "Conditional Sentences", "Relative Clauses", "Passive Voice", 
        "Prepositional Phrases", "Phrasal Verbs", "Articles & Quantifiers", 
        "Reported Speech", "Gerunds vs Infinitives", "Modal Verbs", "Complex Sentence Structures",
        "Subjunctive Mood", "Inversion in English", "Causative Verbs", "Advanced Adjectives & Adverbs",
        "Conjunctions & Transition Words", "Noun Clauses", "Participial Phrases", "Idiomatic Expressions"
      ];
      const hiddenTopic = topics[today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % topics.length];
      const randomDailySeed = Math.random().toString(36).substring(7);
      
      console.log(`[DailyChallenge] Generating NEW random grammar challenge for ${today}. Hidden Topic: ${hiddenTopic}`);
      
      const prompt = `
        Create a 10-question Daily Challenge Quiz for English learners for the date: ${today}.
        PRIMARY FOCUS: ${hiddenTopic} (but mix in other grammar topics too).
        DAILY SEED: ${randomDailySeed}
        
        Requirements:
        1. Mix various grammar topics (tenses, prepositions, articles, etc.) to keep it diverse.
        2. Difficulty: Intermediate to Advanced (B2-C1).
        3. Return a JSON object with a "questions" key containing an array of EXACTLY 10 objects.
        4. Each question MUST be unique, creative, and specifically generated for this seed. Avoid "generic" or "common" textbook examples. Use realistic and modern English scenarios.
        
        Each question object format:
        {
          "question": "What is the correct form of 'to be' in: He _____ happy yesterday?",
          "options": ["is", "was", "were", "be"],
          "correct": 1,
          "explanation": "We use 'was' for singular third-person (He/She/It) in the past tense."
        }
        DO NOT use single-letter placeholders for options. Use real English content.
      `;
      
      const result = await generateJSON(prompt);
      let questions = [];
      
      if (result && Array.isArray(result.questions)) {
        questions = result.questions;
      } else if (Array.isArray(result)) {
        questions = result;
      }

      if (questions.length < 10) {
        throw new Error(`AI generated insufficient questions (${questions.length}/10)`);
      }

      // Slice to exactly 10 if more were returned
      questions = questions.slice(0, 10);

      challenge = new DailyChallenge({
        dateString: today,
        questions
      });
      await challenge.save();
      console.log('Successfully saved new challenge for', today);
    }
    
    res.json({
      challenge,
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
    const isFirstTime = !existing;

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

    // Save submission (only if first time, or we could update it. 
    // Let's create a new one for each attempt or just overwrite? 
    // The user wants to "attempt more than one". Let's save each as a new entry or just update the old one.
    // Actually, let's only save/update the first one for stats, but allow the user to see their result.
    
    if (isFirstTime) {
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
    }

    res.json({
      score: scorePercentage,
      correct: correctCount,
      total: questionsAnswered,
      xpEarned: isFirstTime ? xpEarned : 0,
      coinsEarned: isFirstTime ? Math.floor(xpEarned / 5) : 0,
      isFirstTime,
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
