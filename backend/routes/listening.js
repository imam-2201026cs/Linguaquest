import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/groq.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { updateStreak } from '../middleware/streak.js';

const router = express.Router();

const getLevelTier = (level) => {
  if (level <= 2)  return 'beginner';
  if (level <= 4)  return 'elementary';
  if (level <= 7)  return 'intermediate';
  if (level <= 10) return 'upper_intermediate';
  if (level <= 14) return 'advanced';
  return 'expert';
};

// ── Verified Working Video Library ────────────────────────────────────────────
const VIDEO_LIBRARY = {
  beginner: [
    {
      id: 'v_b1',
      youtubeId: 'mFCOUMsr0Hk',
      title: 'Peppa Pig - Best Moments',
      channel: 'Peppa Pig Official',
      duration: '10 min',
      topic: 'Family & Animals',
      description: 'Fun moments with Peppa Pig and her family - perfect for beginners'
    },
    {
      id: 'v_b2',
      youtubeId: 'tos_O0WFeiM',
      title: 'Wheels on the Bus + More Nursery Rhymes',
      channel: 'Cocomelon',
      duration: '8 min',
      topic: 'Songs & Learning',
      description: 'Popular nursery rhymes to build basic English vocabulary'
    },
    {
      id: 'v_b3',
      youtubeId: 'OPf0YbXqDm0',
      title: 'Simple English for Beginners',
      channel: 'BBC Learning English',
      duration: '6 min',
      topic: 'English Learning',
      description: 'Simple everyday English phrases and vocabulary for beginners'
    },
    {
      id: 'v_b4',
      youtubeId: 'E2x3HdPlkQQ',
      title: 'Kids Vocabulary - Animals',
      channel: 'English Singsing',
      duration: '5 min',
      topic: 'Vocabulary',
      description: 'Learn animal names and sounds in English with fun animations'
    },
  ],
  elementary: [
    {
      id: 'v_e1',
      youtubeId: 'XiCrniLQGYc',
      title: 'Amazing Animals - National Geographic Kids',
      channel: 'Nat Geo Kids',
      duration: '8 min',
      topic: 'Animals & Nature',
      description: 'Fascinating facts about animals from around the world'
    },
    {
      id: 'v_e2',
      youtubeId: '6dR86-dDqhc',
      title: 'Weather Vocabulary for Kids',
      channel: 'English Singsing',
      duration: '5 min',
      topic: 'Weather',
      description: 'Learn weather words and expressions in English'
    },
    {
      id: 'v_e3',
      youtubeId: 'vQFSBFiH8PY',
      title: '6 Minute English - Technology',
      channel: 'BBC Learning English',
      duration: '6 min',
      topic: 'Technology',
      description: 'Talk about technology using everyday English'
    },
    {
      id: 'v_e4',
      youtubeId: 'AnvJ3kpWMG4',
      title: '6 Minute English - Sleep',
      channel: 'BBC Learning English',
      duration: '6 min',
      topic: 'Health',
      description: 'Discuss sleep and health using real natural English'
    },
  ],
  intermediate: [
    {
      id: 'v_i1',
      youtubeId: 'OWASCXDGOWo',
      title: 'How Does the Brain Work?',
      channel: 'TED-Ed',
      duration: '5 min',
      topic: 'Science',
      description: 'An animated explanation of how our brain functions'
    },
    {
      id: 'v_i2',
      youtubeId: 'NbuUW9i-mHs',
      title: 'What Makes a Hero?',
      channel: 'TED-Ed',
      duration: '4 min',
      topic: 'Literature',
      description: "The hero's journey explained through great stories"
    },
    {
      id: 'v_i3',
      youtubeId: 'LnMTBxhUFhY',
      title: 'English Conversation Practice',
      channel: 'English Conversation',
      duration: '10 min',
      topic: 'Conversation',
      description: 'Natural English conversation practice for intermediate learners'
    },
    {
      id: 'v_i4',
      youtubeId: 'VvjUMhKmKAk',
      title: '6 Minute English - Social Media',
      channel: 'BBC Learning English',
      duration: '6 min',
      topic: 'Technology',
      description: 'Discuss social media using real everyday English'
    },
  ],
  upper_intermediate: [
    {
      id: 'v_u1',
      youtubeId: 'arj7oStGLkU',
      title: 'Your Body Language Shapes Who You Are',
      channel: 'TED',
      duration: '21 min',
      topic: 'Psychology',
      description: 'Amy Cuddy on how body language affects your mind and confidence'
    },
    {
      id: 'v_u2',
      youtubeId: 'iG9CE55wbtY',
      title: 'Do Schools Kill Creativity?',
      channel: 'TED',
      duration: '20 min',
      topic: 'Education',
      description: 'Sir Ken Robinson argues that schools suppress creativity in children'
    },
    {
      id: 'v_u3',
      youtubeId: 'H14bBuluwB8',
      title: 'The Power of Introverts',
      channel: 'TED',
      duration: '19 min',
      topic: 'Psychology',
      description: 'Susan Cain celebrates the quiet power of introverted people'
    },
    {
      id: 'v_u4',
      youtubeId: 'RcGyVTAoXEU',
      title: 'The Danger of a Single Story',
      channel: 'TED',
      duration: '18 min',
      topic: 'Culture',
      description: 'Chimamanda Adichie on stereotypes and the power of storytelling'
    },
  ],
  advanced: [
    {
      id: 'v_a1',
      youtubeId: 'VcjzHMhBtf0',
      title: 'How Language Shapes the Way We Think',
      channel: 'TED',
      duration: '14 min',
      topic: 'Language',
      description: 'Lera Boroditsky on how the language you speak influences your thoughts'
    },
    {
      id: 'v_a2',
      youtubeId: '_mG-hhWL_ug',
      title: 'Why Good Leaders Make You Feel Safe',
      channel: 'TED',
      duration: '12 min',
      topic: 'Leadership',
      description: 'Simon Sinek on what truly makes a great and inspiring leader'
    },
    {
      id: 'v_a3',
      youtubeId: 'JC82Il2cjqA',
      title: 'How to Speak So People Want to Listen',
      channel: 'TED',
      duration: '10 min',
      topic: 'Communication',
      description: 'Julian Treasure on the art of powerful and effective speaking'
    },
  ],
  expert: [
    {
      id: 'v_x1',
      youtubeId: '8jPQjjsBbIc',
      title: 'The Puzzle of Motivation',
      channel: 'TED',
      duration: '18 min',
      topic: 'Psychology',
      description: 'Dan Pink challenges traditional notions of what motivates people'
    },
    {
      id: 'v_x2',
      youtubeId: 'eIho2S0ZahI',
      title: 'The Art of Innovation',
      channel: 'TED',
      duration: '16 min',
      topic: 'Business',
      description: 'Tom Kelley on how to build a culture of creativity and innovation'
    },
  ],
};

// ── Get video library ─────────────────────────────────────────────────────────
router.get('/videos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level');
    const userLevel = user?.level || 1;
    const tierUnlockLevels = {
      beginner: 1,
      elementary: 3,
      intermediate: 5,
      upper_intermediate: 8,
      advanced: 11,
      expert: 15
    };

    const library = {};
    Object.entries(VIDEO_LIBRARY).forEach(([tier, videos]) => {
      library[tier] = {
        videos,
        unlocked: userLevel >= tierUnlockLevels[tier],
        requiredLevel: tierUnlockLevels[tier],
        label: {
          beginner: '🟢 Beginner',
          elementary: '🟡 Elementary',
          intermediate: '🟠 Intermediate',
          upper_intermediate: '🔴 Upper Intermediate',
          advanced: '🔥 Advanced',
          expert: '💎 Expert'
        }[tier]
      };
    });

    res.json({ library, userLevel, userTier: getLevelTier(userLevel) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Generate questions for a video ───────────────────────────────────────────
router.post('/video-questions', auth, async (req, res) => {
  try {
    const { videoId, title, topic, description } = req.body;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    const prompt = `You are an English teacher. Generate 5 comprehension questions for a video titled "${title}" about "${topic}". 
Video description: "${description}". 
Questions should be appropriate for ${tier.replace('_', ' ')} level English learners.

Return ONLY valid JSON with no markdown:
{
  "questions": [
    {"id": 1, "question": "<question about main topic>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0, "explanation": "<why correct>"},
    {"id": 2, "question": "<question about key idea>", "options": ["<A>","<B>","<C>","<D>"], "correct": 1, "explanation": "<explanation>"},
    {"id": 3, "question": "<vocabulary question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 2, "explanation": "<explanation>"},
    {"id": 4, "question": "<inference question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 3, "explanation": "<explanation>"},
    {"id": 5, "question": "<opinion or critical thinking question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0, "explanation": "<explanation>"}
  ],
  "vocabulary": [
    {"word": "<key word>", "definition": "<clear definition>", "example": "<example sentence>"}
  ],
  "keyPoints": ["<main point 1>", "<main point 2>", "<main point 3>"],
  "discussionQuestion": "<one open-ended discussion question about the video topic>"
}`;

    const result = await generateJSON(prompt);
    res.json(result);
  } catch (err) {
    console.error('Video questions error:', err);
    res.status(500).json({ message: 'Failed to generate questions. Please try again.' });
  }
});

// ── Generate AI passage ───────────────────────────────────────────────────────
router.post('/generate', auth, async (req, res) => {
  try {
    const { topic = 'daily life' } = req.body;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    const prompt = `Create a short English listening exercise about "${topic}" for ${tier.replace('_', ' ')} level learners.

Return ONLY valid JSON with no markdown:
{
  "title": "<exercise title>",
  "passage": "<natural conversational passage of 80-120 words>",
  "questions": [
    {"id": 1, "question": "<question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0},
    {"id": 2, "question": "<question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 1},
    {"id": 3, "question": "<question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 2}
  ],
  "vocabulary": [{"word": "<word>", "meaning": "<simple definition>"}]
}`;

    const exercise = await generateJSON(prompt);
    res.json(exercise);
  } catch (err) {
    console.error('Listening Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate exercise, try again.' });
  }
});

// ── Get topics and user info ──────────────────────────────────────────────────
router.get('/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);
    const topics = [
      'Daily Life', 'Travel & Tourism', 'Technology',
      'Health & Wellness', 'Environment', 'Food & Culture',
      'Science', 'Sports', 'Business', 'History'
    ];
    res.json({ topics, tier, level: user?.level || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Submit answers ────────────────────────────────────────────────────────────
router.post('/submit', auth, async (req, res) => {
  try {
    const { answers, questions, topic, timeSpent, mode } = req.body;
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);

    let xpEarned = Math.floor(score / 10) * 4 + 8;
    if (mode === 'video') xpEarned += 10;
    if (score === 100) xpEarned += 15;
    const coinsEarned = Math.floor(xpEarned / 2);

    const activity = new Activity({
      userId: req.user._id,
      type: 'listening',
      topic,
      score,
      maxScore: 100,
      xpEarned,
      coinsEarned,
      timeSpent: timeSpent || 0,
      details: { correct, total: questions.length, answers, mode }
    });
    await activity.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        xp: xpEarned,
        coins: coinsEarned,
        'stats.listeningCompleted': 1
      }
    });

    await updateStreak(req.user._id);
    res.json({ score, correct, total: questions.length, xpEarned, coinsEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;