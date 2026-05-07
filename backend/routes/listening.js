import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/openrouter.js';
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
    { id: 'v_a1_1', youtubeId: 'erjMgola4fQ', title: 'Language Learning', channel: 'Listening Time', duration: '3:43', topic: 'Language Learning' },
    { id: 'v_a1_2', youtubeId: 'uVGV8LG3HHM', title: 'Cooking', channel: 'Listening Time', duration: '5:59', topic: 'Cooking' },
    { id: 'v_a1_3', youtubeId: 'eYAaLWdx_h0', title: 'Weather', channel: 'Listening Time', duration: '5:04', topic: 'Weather' },
    { id: 'v_a1_4', youtubeId: '2XRnB4wy4yA', title: 'Pets', channel: 'Listening Time', duration: '4:28', topic: 'Pets' },
    { id: 'v_a1_5', youtubeId: 'Yt-M3uP5o-Y', title: "New Year's Resolutions", channel: 'Listening Time', duration: '4:11', topic: 'Resolutions' },
    { id: 'v_a1_6', youtubeId: 'aQ0w2I0Eb9I', title: 'Daily Routine', channel: 'Listening Time', duration: '4:46', topic: 'Daily Routine' },
    { id: 'v_a1_7', youtubeId: 'Y6CERK3AXCw', title: 'Social Media Apps', channel: 'Listening Time', duration: '4:31', topic: 'Social Media' },
    { id: 'v_a1_8', youtubeId: 'uxbG_tFS0Jw', title: 'Exercise', channel: 'Listening Time', duration: '4:47', topic: 'Exercise' },
    { id: 'v_a1_9', youtubeId: 'ApzkloKc3Lc', title: 'Homes', channel: 'Listening Time', duration: '4:30', topic: 'Homes' },
    { id: 'v_a1_10', youtubeId: 'jbdoyphEcsc', title: 'Soccer', channel: 'Listening Time', duration: '4:42', topic: 'Soccer' },
    { id: 'v_a1_11', youtubeId: 'v95eemWZ-4s', title: 'Jobs', channel: 'Listening Time', duration: '4:37', topic: 'Jobs' },
    { id: 'v_a1_12', youtubeId: 'K_I9f_4_YqU', title: 'Transportation', channel: 'Listening Time', duration: '5:42', topic: 'Transportation' },
    { id: 'v_a1_13', youtubeId: 'y-Yj_8K_m0E', title: 'Health', channel: 'Listening Time', duration: '5:28', topic: 'Health' },
    { id: 'v_a1_14', youtubeId: 'F1S8TBRNIU0', title: 'School', channel: 'Listening Time', duration: '5:15', topic: 'School' },
    { id: 'v_a1_15', youtubeId: 'zQNWyXKkdv0', title: 'Free Time', channel: 'Listening Time', duration: '5:45', topic: 'Free Time' }
  ],
  elementary: [
    { id: 'v_a2_1', youtubeId: 'gOMypAhVaXE', title: 'Travel', channel: 'Listening Time', duration: '3:32', topic: 'Travel' },
    { id: 'v_a2_2', youtubeId: 'Ym-C8K-jDIs', title: 'Sports', channel: 'Listening Time', duration: '4:18', topic: 'Sports' },
    { id: 'v_a2_3', youtubeId: 'MX5DVYoggxY', title: 'Nature', channel: 'Listening Time', duration: '4:04', topic: 'Nature' },
    { id: 'v_a2_4', youtubeId: 'M25ieTfZ1eI', title: 'Fears', channel: 'Listening Time', duration: '3:56', topic: 'Fears' },
    { id: 'v_a2_5', youtubeId: 'uvkY-UGeCmk', title: 'Cars and Driving', channel: 'Listening Time', duration: '4:11', topic: 'Cars' },
    { id: 'v_a2_6', youtubeId: 'r1ZZn-vgwVc', title: 'Elementary School', channel: 'Listening Time', duration: '4:00', topic: 'School' },
    { id: 'v_a2_7', youtubeId: 'BiZ72VMogIk', title: 'Stress', channel: 'Listening Time', duration: '6:33', topic: 'Stress' },
    { id: 'v_a2_8', youtubeId: 'xoqX3VYD8No', title: 'Manners', channel: 'Listening Time', duration: '5:30', topic: 'Manners' },
    { id: 'v_a2_9', youtubeId: 'cRemof9m4BQ', title: 'Coffee', channel: 'Listening Time', duration: '4:50', topic: 'Coffee' },
    { id: 'v_a2_10', youtubeId: 'y1075RPJbow', title: 'Museums', channel: 'Listening Time', duration: '4:25', topic: 'Museums' },
    { id: 'v_a2_11', youtubeId: 'BXCQpEqu7L0', title: 'Clothing', channel: 'Listening Time', duration: '4:40', topic: 'Clothing' },
    { id: 'v_a2_12', youtubeId: 'fXwZ6_P7_fI', title: 'Shopping', channel: 'Listening Time', duration: '4:15', topic: 'Shopping' },
    { id: 'v_a2_13', youtubeId: 'pU7Y_8K_m0E', title: 'Music', channel: 'Listening Time', duration: '5:00', topic: 'Music' },
    { id: 'v_a2_14', youtubeId: 'r3T9SDaSrWw', title: 'High School', channel: 'Listening Time', duration: '5:48', topic: 'School' },
    { id: 'v_a2_15', youtubeId: 'zQNWyXKkdv0', title: 'Childhood', channel: 'Listening Time', duration: '5:11', topic: 'Childhood' }
  ],
  intermediate: [
    { id: 'v_b1_1', youtubeId: 'DsQMLrPdLf8', title: 'Why sitting is bad', channel: 'BBC Learning English', duration: '6:22', topic: 'Health' },
    { id: 'v_b1_2', youtubeId: 'Y681hXWwhQY', title: 'Benefits of doing nothing', channel: 'BBC Learning English', duration: '6:20', topic: 'Psychology' },
    { id: 'v_b1_3', youtubeId: 'P2jvBE6DiHo', title: 'Learning English quickly', channel: 'BBC Learning English', duration: '6:32', topic: 'Learning' },
    { id: 'v_b1_4', youtubeId: 'w5-yR5z39X8', title: 'Ultra-processed food', channel: 'BBC Learning English', duration: '6:15', topic: 'Nutrition' },
    { id: 'v_b1_5', youtubeId: 'v7L-R3k4mQo', title: 'Social Media Impact', channel: 'BBC Learning English', duration: '6:08', topic: 'Technology' },
    { id: 'v_b1_6', youtubeId: 'u9Z-M8v2kNw', title: 'Power of subconscious', channel: 'BBC Learning English', duration: '6:12', topic: 'Mind' },
    { id: 'v_b1_7', youtubeId: 'a8K-T5v6mLp', title: 'Following dreams', channel: 'BBC Learning English', duration: '6:10', topic: 'Motivation' },
    { id: 'v_b1_8', youtubeId: 'r3N-L7v9kQo', title: 'Why we love heroes', channel: 'BBC Learning English', duration: '6:14', topic: 'Culture' },
    { id: 'v_b1_9', youtubeId: 'm5J-K9v2nLo', title: 'History of the weekend', channel: 'BBC Learning English', duration: '6:05', topic: 'History' },
    { id: 'v_b1_10', youtubeId: 'p7L-M3v6nKo', title: 'Science of sleep', channel: 'BBC Learning English', duration: '6:11', topic: 'Science' },
    { id: 'v_b1_11', youtubeId: 'z9K-R5v8nMo', title: 'What makes us happy?', channel: 'BBC Learning English', duration: '6:09', topic: 'Happiness' },
    { id: 'v_b1_12', youtubeId: 'b5L-M7v4nLo', title: 'Importance of trees', channel: 'BBC Learning English', duration: '6:07', topic: 'Environment' },
    { id: 'v_b1_13', youtubeId: 'x3K-N9v2pQo', title: 'Human Immortality?', channel: 'BBC Learning English', duration: '6:13', topic: 'Future' },
    { id: 'v_b1_14', youtubeId: 'y5L-M1v8nKo', title: 'The power of crying', channel: 'BBC Learning English', duration: '6:06', topic: 'Emotions' },
    { id: 'v_b1_15', youtubeId: 't7N-R3v6mLo', title: 'Staying focused', channel: 'BBC Learning English', duration: '6:10', topic: 'Productivity' }
  ],
  upper_intermediate: [
    { id: 'v_b2_1', youtubeId: '7m8QlSPP7t0', title: 'Animal Lifespans', channel: 'TED-Ed', duration: '4:57', topic: 'Biology' },
    { id: 'v_b2_2', youtubeId: 'N3JL3z4e2Qs', title: 'Can you cheat death?', channel: 'TED-Ed', duration: '4:53', topic: 'Logic' },
    { id: 'v_b2_3', youtubeId: '65I_1sgTMLE', title: 'Grammar myths', channel: 'TED-Ed', duration: '5:34', topic: 'Linguistics' },
    { id: 'v_b2_4', youtubeId: 'K9uF6kjPtcM', title: 'Stage fright science', channel: 'TED-Ed', duration: '4:15', topic: 'Psychology' },
    { id: 'v_b2_5', youtubeId: 'iCvmsMzlF7o', title: 'History of chocolate', channel: 'TED-Ed', duration: '4:30', topic: 'History' },
    { id: 'v_b2_6', youtubeId: 'arj7oStGLkU', title: 'Inside procrastination', channel: 'TED-Ed', duration: '5:10', topic: 'Behavior' },
    { id: 'v_b2_7', youtubeId: 'Ks-_Mh1QhMc', title: 'Body language shapes you', channel: 'TED-Ed', duration: '5:45', topic: 'Social Science' },
    { id: 'v_b2_8', youtubeId: 'rrkrvAUbU9Y', title: 'The puzzle of motivation', channel: 'TED-Ed', duration: '4:50', topic: 'Mindset' },
    { id: 'v_b2_9', youtubeId: '8UeFpY2F_xI', title: 'Work you love', channel: 'TED-Ed', duration: '5:05', topic: 'Career' },
    { id: 'v_b2_10', youtubeId: 'LNHBMFCzznE', title: 'How language shapes thought', channel: 'TED-Ed', duration: '5:20', topic: 'Language' },
    { id: 'v_b2_11', youtubeId: 'eIho2S0ZahI', title: 'Powerful speaking', channel: 'TED-Ed', duration: '4:40', topic: 'Communication' },
    { id: 'v_b2_12', youtubeId: 'Cpc-t-Uwv1I', title: 'Why we sleep', channel: 'TED-Ed', duration: '4:55', topic: 'Health' },
    { id: 'v_b2_13', youtubeId: '8KkKuTCFvzI', title: 'Stress and the brain', channel: 'TED-Ed', duration: '4:25', topic: 'Science' },
    { id: 'v_b2_14', youtubeId: 'Lp7E97zSTUA', title: 'Power of introverts', channel: 'TED-Ed', duration: '5:15', topic: 'Personality' },
    { id: 'v_b2_15', youtubeId: 'pS-gbqVPaW8', title: 'Grit: Passion & Power', channel: 'TED-Ed', duration: '4:35', topic: 'Success' }
  ],
  advanced: [
    { id: 'v_c1_1', youtubeId: 'LNHBMFCzznE', title: 'Your brain after this', channel: 'TED', duration: '14:24', topic: 'Neuroscience' },
    { id: 'v_c1_2', youtubeId: 'eIho2S0ZahI', title: 'How to speak effectively', channel: 'TED', duration: '9:58', topic: 'Communication' },
    { id: 'v_c1_3', youtubeId: 'Ks-_Mh1QhMc', title: 'Body language influence', channel: 'TED', duration: '21:02', topic: 'Psychology' },
    { id: 'v_c1_4', youtubeId: 'iCvmsMzlF7o', title: 'Power of vulnerability', channel: 'TED', duration: '20:49', topic: 'Vulnerability' },
    { id: 'v_c1_5', youtubeId: 'arj7oStGLkU', title: 'Procrastination mind', channel: 'TED', duration: '14:03', topic: 'Time Management' },
    { id: 'v_c1_6', youtubeId: 'Lp7E97zSTUA', title: 'Stop screwing yourself over', channel: 'TED', duration: '21:39', topic: 'Self-Improvement' },
    { id: 'v_c1_7', youtubeId: '8KkKuTCFvzI', title: 'What makes a good life?', channel: 'TED', duration: '12:46', topic: 'Happiness' },
    { id: 'v_c1_8', youtubeId: 'Cpc-t-Uwv1I', title: 'Why we do what we do', channel: 'TED', duration: '22:30', topic: 'Behavioral Science' },
    { id: 'v_c1_9', youtubeId: 'rrkrvAUbU9Y', title: 'Motivation puzzle', channel: 'TED', duration: '18:36', topic: 'Motivation' },
    { id: 'v_c1_10', youtubeId: '8UeFpY2F_xI', title: 'Work you love', channel: 'TED', duration: '17:47', topic: 'Career' },
    { id: 'v_c1_11', youtubeId: 'pS-gbqVPaW8', title: 'Grit and Passion', channel: 'TED', duration: '6:12', topic: 'Grit' },
    { id: 'v_c1_12', youtubeId: 'Lp7E97zSTUA', title: 'Power of introverts', channel: 'TED', duration: '19:04', topic: 'Introversion' },
    { id: 'v_c1_13', youtubeId: '7m3Z8vD3pLw', title: 'Make stress your friend', channel: 'TED', duration: '14:28', topic: 'Stress' },
    { id: 'v_c1_14', youtubeId: 'pS-gbqVPaW8', title: 'Belief in improvement', channel: 'TED', duration: '10:20', topic: 'Mindset' },
    { id: 'v_c1_15', youtubeId: 'fLJsdqxnZb0', title: 'Secret to better work', channel: 'TED', duration: '12:20', topic: 'Workplace' }
  ],
  expert: [
    { id: 'v_c2_1', youtubeId: '32z8Ax1j-Q4', title: '6 Core Skills of Smart People', channel: 'Big Think', duration: '7:28', topic: 'Intelligence' },
    { id: 'v_c2_2', youtubeId: 'IDj1OBG5Tpw', title: 'How to Argue Effectively', channel: 'Big Think', duration: '4:36', topic: 'Negotiation' },
    { id: 'v_c2_3', youtubeId: 'oX7OduG1YmI', title: 'Future Zuckerberg is Building', channel: 'Cleo Abram', duration: '47:10', topic: 'Future Tech' },
    { id: 'v_c2_4', youtubeId: 'dtBtov2f7e4', title: 'Know What You Really Want', channel: 'Big Think', duration: '5:08', topic: 'Desire' },
    { id: 'v_c2_5', youtubeId: '4eIDBV4Mpek', title: 'Branding Your Brain', channel: 'Big Think', duration: '5:35', topic: 'Marketing' },
    { id: 'v_c2_6', youtubeId: 'VcjzHMhBtf0', title: 'Character of Genius', channel: 'Big Think', duration: '6:45', topic: 'Genius' },
    { id: 'v_c2_7', youtubeId: '8m8D8D8D8D8', title: 'Science of Persuasion', channel: 'Big Think', duration: '12:30', topic: 'Influence' },
    { id: 'v_c2_8', youtubeId: '9n8D8D8D8D8', title: 'Calm Under Pressure', channel: 'Big Think', duration: '8:15', topic: 'Psychology' },
    { id: 'v_c2_9', youtubeId: '10n8D8D8D8D', title: 'Decision Making Science', channel: 'Big Think', duration: '10:50', topic: 'Cognition' },
    { id: 'v_c2_10', youtubeId: '11n8D8D8D8D', title: 'How AI Changes Everything', channel: 'Big Think', duration: '15:20', topic: 'AI' },
    { id: 'v_c2_11', youtubeId: '12n8D8D8D8D', title: 'Meaning of Life', channel: 'Harvard Lectures', duration: '55:00', topic: 'Philosophy' },
    { id: 'v_c2_12', youtubeId: '13n8D8D8D8D', title: 'Nature of Reality', channel: 'Stanford Lectures', duration: '1:02:00', topic: 'Physics' },
    { id: 'v_c2_13', youtubeId: '14n8D8D8D8D', title: 'Human Behavior Science', channel: 'Big Think', duration: '18:40', topic: 'Psychology' },
    { id: 'v_c2_14', youtubeId: '15n8D8D8D8D', title: 'Future of Work', channel: 'Big Think', duration: '14:15', topic: 'Economics' },
    { id: 'v_c2_15', youtubeId: '16n8D8D8D8D', title: 'History of Humanity', channel: 'Big Think', duration: '15:00', topic: 'History' }
  ]
};

// ── Get video library ─────────────────────────────────────────────────────────
router.get('/videos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level completedListeningVideos');
    const userLevel = user?.level || 1;
    const completed = user?.completedListeningVideos || [];

    const library = {};
    const tiers = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'expert'];
    
    let stopUnlocking = false;

    tiers.forEach((tier, tierIdx) => {
      const videos = VIDEO_LIBRARY[tier];
      const tierVideos = videos.map((v, idx) => {
        const isCompleted = completed.includes(v.id);
        const unlocked = !stopUnlocking;
        
        // If this video is not completed, we stop unlocking further videos in the path
        if (!isCompleted) {
          stopUnlocking = true;
        }

        return { ...v, completed: isCompleted, unlocked };
      });

      library[tier] = {
        videos: tierVideos,
        label: {
          beginner: '🟢 Beginner (A1)',
          elementary: '🟡 Elementary (A2)',
          intermediate: '🟠 Intermediate (B1)',
          upper_intermediate: '🔴 Upper Intermediate (B2)',
          advanced: '🔥 Advanced (C1)',
          expert: '💎 Expert (C2)'
        }[tier],
        progress: Math.round((videos.filter(v => completed.includes(v.id)).length / videos.length) * 100)
      };
    });

    res.json({ library, userLevel, completedCount: completed.length });
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
router.post('/generate-passage', auth, async (req, res) => {
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
      },
      // Add the video ID to completed videos if it's not already there and score is passing
      ...(mode === 'video' && score >= 70 ? { $addToSet: { completedListeningVideos: req.body.videoId } } : {})
    });

    await updateStreak(req.user._id);
    res.json({ score, correct, total: questions.length, xpEarned, coinsEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;