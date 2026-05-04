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

// ── Curated video library by level ───────────────────────────────────────────
const VIDEO_LIBRARY = {
  beginner: [
    { id: 'v_b1', youtubeId: 'aXd5MkMQmA8', title: 'Peppa Pig - Muddy Puddles', channel: 'Peppa Pig Official', duration: '5 min', topic: 'Family & Animals', description: 'Peppa and George love jumping in muddy puddles' },
    { id: 'v_b2', youtubeId: '5a6nXzFBJEg', title: 'Popular Nursery Rhymes', channel: 'Little Baby Bum', duration: '10 min', topic: 'Songs & Learning', description: 'Classic nursery rhymes to build vocabulary' },
    { id: 'v_b3', youtubeId: 'GbyHNFpyLKo', title: 'The Three Little Pigs', channel: 'Fairy Tales', duration: '8 min', topic: 'Stories', description: 'The classic fairy tale about three pigs and a wolf' },
    { id: 'v_b4', youtubeId: 'XBHSoxEnGF0', title: 'Goldilocks and the Three Bears', channel: 'Story Time', duration: '7 min', topic: 'Stories', description: 'A girl visits the home of three bears' },
  ],
  elementary: [
    { id: 'v_e1', youtubeId: 'gcRbBFgJTEs', title: 'Amazing Animal Facts', channel: 'National Geographic Kids', duration: '8 min', topic: 'Animals & Nature', description: 'Fascinating facts about animals from around the world' },
    { id: 'v_e2', youtubeId: 'eVmkiMXViXM', title: 'Why Is the Sky Blue?', channel: 'SciShow Kids', duration: '5 min', topic: 'Science', description: 'A simple explanation of why the sky looks blue' },
    { id: 'v_e3', youtubeId: 'DN43sCkT6tM', title: 'How Do Plants Grow?', channel: 'SciShow Kids', duration: '6 min', topic: 'Science & Nature', description: 'Learn how plants grow from seeds to full plants' },
    { id: 'v_e4', youtubeId: 'GDJ4JFVeJpY', title: 'Amazing Animal Babies', channel: 'BBC Earth Kids', duration: '9 min', topic: 'Animals', description: 'Adorable baby animals and how they grow up' },
  ],
  intermediate: [
    { id: 'v_i1', youtubeId: 'OWASCXDGOWo', title: 'How Does the Brain Work?', channel: 'TED-Ed', duration: '5 min', topic: 'Science', description: 'An animated explanation of how our brain functions' },
    { id: 'v_i2', youtubeId: 'e-QFj59PON4', title: 'History of the English Language', channel: 'TED-Ed', duration: '5 min', topic: 'Language', description: 'How English evolved over 1,400 years' },
    { id: 'v_i3', youtubeId: 'NbuUW9i-mHs', title: 'What Makes a Hero?', channel: 'TED-Ed', duration: '4 min', topic: 'Literature', description: 'The hero\'s journey explained through great stories' },
    { id: 'v_i4', youtubeId: 'Y6e_m9iq-4Q', title: 'How Do Vaccines Work?', channel: 'TED-Ed', duration: '5 min', topic: 'Health', description: 'The science behind vaccines and immunity' },
    { id: 'v_i5', youtubeId: 'AnvJ3kpWMG4', title: '6 Minute English: Social Media', channel: 'BBC Learning English', duration: '6 min', topic: 'Technology', description: 'Discuss social media using real English' },
  ],
  upper_intermediate: [
    { id: 'v_u1', youtubeId: 'arj7oStGLkU', title: 'Your Body Language Shapes Who You Are', channel: 'TED', duration: '21 min', topic: 'Psychology', description: 'Amy Cuddy on how body language affects your mind' },
    { id: 'v_u2', youtubeId: 'H14bBuluwB8', title: 'The Power of Introverts', channel: 'TED', duration: '19 min', topic: 'Psychology', description: 'Susan Cain celebrates the power of introverts' },
    { id: 'v_u3', youtubeId: 'iG9CE55wbtY', title: 'Do Schools Kill Creativity?', channel: 'TED', duration: '20 min', topic: 'Education', description: 'Sir Ken Robinson argues schools suppress creativity' },
    { id: 'v_u4', youtubeId: 'dSu5sXmsur4', title: 'Bacteria: Our Tiny Friends', channel: 'Kurzgesagt', duration: '8 min', topic: 'Science', description: 'How bacteria in our body help keep us healthy' },
  ],
  advanced: [
    { id: 'v_a1', youtubeId: 'RcGyVTAoXEU', title: 'The Danger of a Single Story', channel: 'TED', duration: '18 min', topic: 'Culture', description: 'Chimamanda Adichie on stereotypes and storytelling' },
    { id: 'v_a2', youtubeId: 'VcjzHMhBtf0', title: 'How Language Shapes the Way We Think', channel: 'TED', duration: '14 min', topic: 'Language', description: 'Lera Boroditsky on how language influences thought' },
    { id: 'v_a3', youtubeId: '0tb7mfv7H-Y', title: 'Why I Read a Book a Day', channel: 'TED', duration: '17 min', topic: 'Learning', description: 'Tai Lopez on learning and personal development' },
  ],
  expert: [
    { id: 'v_x1', youtubeId: 'BKorP55Aqvg', title: 'MIT Introduction to Artificial Intelligence', channel: 'MIT OpenCourseWare', duration: '50 min', topic: 'Technology', description: 'MIT lecture on the fundamentals of AI' },
    { id: 'v_x2', youtubeId: '7R0aICYvRPc', title: 'Justice: What Is the Right Thing to Do?', channel: 'Harvard University', duration: '55 min', topic: 'Philosophy', description: 'Harvard\'s famous Justice lecture by Michael Sandel' },
  ],
};

// ── Get video library ─────────────────────────────────────────────────────────
router.get('/videos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level');
    const userLevel = user?.level || 1;
    const tierUnlockLevels = { beginner: 1, elementary: 3, intermediate: 5, upper_intermediate: 8, advanced: 11, expert: 15 };

    const library = {};
    Object.entries(VIDEO_LIBRARY).forEach(([tier, videos]) => {
      library[tier] = {
        videos,
        unlocked: userLevel >= tierUnlockLevels[tier],
        requiredLevel: tierUnlockLevels[tier],
        label: { beginner: '🟢 Beginner', elementary: '🟡 Elementary', intermediate: '🟠 Intermediate', upper_intermediate: '🔴 Upper Intermediate', advanced: '🔥 Advanced', expert: '💎 Expert' }[tier]
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

    const prompt = `You are an English teacher. Generate 5 comprehension questions for a video titled "${title}" about "${topic}". Video description: "${description}". Questions should be appropriate for ${tier.replace('_', ' ')} level learners.

Return ONLY JSON:
{
  "questions": [
    {"id": 1, "question": "<question about main topic>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0, "explanation": "<why correct>"},
    {"id": 2, "question": "<question about key idea>", "options": ["<A>","<B>","<C>","<D>"], "correct": 1, "explanation": "<explanation>"},
    {"id": 3, "question": "<vocabulary question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 2, "explanation": "<explanation>"},
    {"id": 4, "question": "<inference question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 3, "explanation": "<explanation>"},
    {"id": 5, "question": "<opinion/critical thinking question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0, "explanation": "<explanation>"}
  ],
  "vocabulary": [
    {"word": "<key word from the topic>", "definition": "<clear definition>", "example": "<example sentence>"}
  ],
  "keyPoints": ["<main point 1>", "<main point 2>", "<main point 3>"],
  "discussionQuestion": "<one open-ended discussion question about the video topic>"
}`;

    const result = await generateJSON(prompt);
    res.json(result);
  } catch (err) {
    console.error('Video questions error:', err);
    res.status(500).json({ message: 'Failed to generate questions. Try again.' });
  }
});

// ── Generate AI passage (original feature kept) ───────────────────────────────
router.post('/generate', auth, async (req, res) => {
  try {
    const { topic = 'daily life' } = req.body;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    const prompt = `Create a short English listening exercise about "${topic}" for ${tier.replace('_', ' ')} level learners.

Return ONLY JSON:
{
  "title": "<exercise title>",
  "passage": "<natural conversational passage of 80-120 words suitable for listening practice>",
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

// ── Get topics and user level ─────────────────────────────────────────────────
router.get('/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);
    const topics = ['Daily Life', 'Travel & Tourism', 'Technology', 'Health & Wellness', 'Environment', 'Food & Culture', 'Science', 'Sports', 'Business', 'History'];
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
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const score = Math.round((correct / questions.length) * 100);

    let xpEarned = Math.floor(score / 10) * 4 + 8;
    if (mode === 'video') xpEarned += 10;
    if (score === 100) xpEarned += 15;
    const coinsEarned = Math.floor(xpEarned / 2);

    const activity = new Activity({ userId: req.user._id, type: 'listening', topic, score, maxScore: 100, xpEarned, coinsEarned, timeSpent: timeSpent || 0, details: { correct, total: questions.length, answers, mode } });
    await activity.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned, coins: coinsEarned, 'stats.listeningCompleted': 1 } });
    await updateStreak(req.user._id);
    res.json({ score, correct, total: questions.length, xpEarned, coinsEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
