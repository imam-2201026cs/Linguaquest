import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON, generateContent } from '../middleware/groq.js';
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

export const WRITING_MODES = [
  { id: 'story_continuation', label: 'Story Continuation', emoji: '📖', desc: 'Continue a story from where it left off', xp: '20-60 XP', color: 'from-blue-600 to-cyan-500', unlockLevel: 1 },
  { id: 'picture_writing',    label: 'Picture Writing',    emoji: '🖼️', desc: 'Describe and write about an image',        xp: '15-50 XP', color: 'from-purple-600 to-pink-500', unlockLevel: 1 },
  { id: 'timed_challenge',    label: 'Timed Challenge',    emoji: '⏱️', desc: 'Write before the clock runs out',          xp: '25-70 XP', color: 'from-red-600 to-orange-500', unlockLevel: 2 },
  { id: 'news_article',       label: 'News Article',       emoji: '📰', desc: 'Write a full article from a headline',     xp: '20-55 XP', color: 'from-green-600 to-emerald-500', unlockLevel: 2 },
  { id: 'letter_email',       label: 'Letter / Email',     emoji: '✉️', desc: 'Write formal or informal letters',         xp: '20-50 XP', color: 'from-yellow-600 to-amber-500', unlockLevel: 1 },
  { id: 'creative_scene',     label: 'Creative Scene',     emoji: '🎭', desc: 'Write a scene with given characters',      xp: '25-65 XP', color: 'from-violet-600 to-purple-500', unlockLevel: 3 },
];

const PROMPTS = {
  story_continuation: {
    beginner:           [{ id: 1, starter: 'The little dog found a big red ball in the park. He picked it up and...', topic: 'Animals', minWords: 60 }, { id: 2, starter: 'One sunny morning, a girl named Lily woke up and saw something very strange outside her window...', topic: 'Adventure', minWords: 60 }],
    elementary:         [{ id: 3, starter: 'Tom was exploring the old house when he heard a strange noise coming from the attic...', topic: 'Mystery', minWords: 80 }, { id: 4, starter: 'The spaceship landed in the school playground. A small green creature stepped out and looked around...', topic: 'Sci-Fi', minWords: 80 }],
    intermediate:       [{ id: 5, starter: 'The detective entered the dimly lit room and immediately noticed something was terribly wrong. The window was broken from the inside...', topic: 'Mystery', minWords: 120 }, { id: 6, starter: 'The old map had been in the family for generations. Nobody had ever tried to follow it — until today...', topic: 'Adventure', minWords: 120 }],
    upper_intermediate: [{ id: 7, starter: 'The committee had gathered for what would be the most important meeting of the century. At stake was the future of...', topic: 'Thriller', minWords: 150 }, { id: 8, starter: 'The laboratory was silent except for the hum of machines. Dr. Chen looked at her results and felt her hands begin to shake...', topic: 'Sci-Fi', minWords: 150 }],
    advanced:           [{ id: 9, starter: 'The philosophical implications of her discovery were staggering. If what the data suggested was true, everything humanity believed about consciousness was...', topic: 'Literary', minWords: 200 }, { id: 10, starter: 'In retrospect, the signs had been obvious. But hindsight, as they say, is a luxury afforded only to survivors...', topic: 'Thriller', minWords: 200 }],
    expert:             [{ id: 11, starter: 'The epistemological foundations upon which modern science rests are, upon closer examination, more fragile than we care to admit...', topic: 'Academic', minWords: 250 }, { id: 12, starter: 'Consider the paradox at the heart of democratic governance: the tyranny of the majority over the informed minority...', topic: 'Philosophy', minWords: 250 }],
  },
  news_article: {
    beginner:           [{ id: 1, headline: 'Local School Opens Brand New Library', context: 'Write about the opening ceremony, who attended, and why it is important for students.', minWords: 60 }, { id: 2, headline: 'Stray Dog Finds New Home After Going Viral Online', context: 'Write a feel-good story about a rescued dog and the family that adopted it.', minWords: 60 }],
    elementary:         [{ id: 3, headline: 'City Zoo Welcomes Baby Elephant Named Benny', context: 'Write about the baby elephant, how he was born, what he likes, and visitors reactions.', minWords: 80 }, { id: 4, headline: 'Students Win National Science Competition', context: 'Write about the students, their project, the competition, and what they won.', minWords: 80 }],
    intermediate:       [{ id: 5, headline: 'New App Helps Students Learn Languages Faster Using AI', context: 'Write about the technology, how it works, expert opinions, and student experiences.', minWords: 120 }, { id: 6, headline: 'City Plans to Plant 10,000 Trees to Fight Pollution', context: 'Write about the plan, why it is needed, who is involved, and expected results.', minWords: 120 }],
    upper_intermediate: [{ id: 7, headline: 'Government Announces Major Climate Change Policy Overhaul', context: 'Write a balanced news report covering the policy, supporters, critics, and expert analysis.', minWords: 150 }, { id: 8, headline: 'Artificial Intelligence Company Raises $2 Billion in Funding', context: 'Write about the company, what they do, why investors are interested, and concerns raised.', minWords: 150 }],
    advanced:           [{ id: 9, headline: 'Research Reveals Alarming Link Between Social Media and Youth Mental Health', context: 'Write an in-depth report covering research findings, methodology, expert commentary, and policy implications.', minWords: 200 }],
    expert:             [{ id: 10, headline: 'Quantum Computing Breakthrough Threatens Global Encryption Standards', context: 'Write a technically accurate, nuanced report for an educated audience covering all implications.', minWords: 250 }],
  },
  letter_email: {
    beginner:           [{ id: 1, situation: 'Write a postcard to your best friend telling them about your holiday at the beach.', format: 'Postcard', tone: 'friendly and casual', minWords: 50 }, { id: 2, situation: 'Write a thank you letter to your teacher for being so helpful this year.', format: 'Thank You Letter', tone: 'warm and sincere', minWords: 60 }],
    elementary:         [{ id: 3, situation: 'Write an invitation letter to your friend inviting them to your birthday party this weekend.', format: 'Invitation', tone: 'friendly and excited', minWords: 80 }, { id: 4, situation: 'Write a letter to your pen pal in another country introducing yourself and your family.', format: 'Friendly Letter', tone: 'friendly and descriptive', minWords: 80 }],
    intermediate:       [{ id: 5, situation: 'You ordered a laptop online 2 weeks ago. It arrived broken. Write a complaint email to the company asking for a replacement or refund.', format: 'Complaint Email', tone: 'polite but firm', minWords: 120 }, { id: 6, situation: 'Write a job application letter for a position as a junior graphic designer at a creative agency.', format: 'Application Letter', tone: 'professional and enthusiastic', minWords: 120 }],
    upper_intermediate: [{ id: 7, situation: 'Write a formal letter to your local government representative about the poor condition of roads in your area. Include specific examples and propose solutions.', format: 'Formal Letter', tone: 'formal and persuasive', minWords: 150 }, { id: 8, situation: 'Your company wants to partner with an international firm. Write a professional email proposing the partnership and outlining mutual benefits.', format: 'Business Email', tone: 'professional and persuasive', minWords: 150 }],
    advanced:           [{ id: 9, situation: 'Write a letter to the editor of a national newspaper responding to an article that claimed social media has no negative effects on teenagers. Provide evidence-based counterarguments.', format: 'Letter to Editor', tone: 'formal and analytical', minWords: 200 }],
    expert:             [{ id: 10, situation: 'Write a research proposal letter to a university department requesting funding for a study on the effects of AI on employment in developing countries.', format: 'Research Proposal', tone: 'academic and precise', minWords: 280 }],
  },
  creative_scene: {
    beginner:           [{ id: 1, characters: 'A friendly robot named Beep and a curious child named Sam', setting: 'A colourful toyshop', situation: 'Beep helps Sam find the perfect birthday gift for a friend', minWords: 60 }],
    elementary:         [{ id: 2, characters: 'Emma (12, a curious girl) and Mr. Johnson (a mysterious old librarian)', setting: 'An old library at midnight', situation: 'Emma discovers that Mr. Johnson has a magical secret hidden behind the last bookshelf', minWords: 100 }, { id: 3, characters: 'Two best friends Jake and Maya', setting: 'A treehouse during a thunderstorm', situation: 'They find an old treasure map hidden inside the treehouse walls', minWords: 100 }],
    intermediate:       [{ id: 4, characters: 'A young detective named Clara and a nervous suspect named Victor', setting: 'A police interrogation room', situation: 'Clara must uncover the truth about a stolen painting using only conversation', minWords: 130 }, { id: 5, characters: 'Captain Rodriguez (veteran astronaut) and Dr. Kim (nervous rookie)', setting: 'A space station with a failing oxygen system', situation: 'They must work together to fix the problem before time runs out', minWords: 130 }],
    upper_intermediate: [{ id: 6, characters: 'A disgraced journalist Helen and an anonymous whistleblower', setting: 'A rainy cafe at closing time', situation: 'The source reveals information that could change everything — but at a dangerous price', minWords: 160 }],
    advanced:           [{ id: 7, characters: 'An elderly philosopher and their sceptical student', setting: 'A hospital room at dusk', situation: 'A final conversation about the meaning of a life well-lived — include philosophical ideas', minWords: 220 }],
    expert:             [{ id: 8, characters: 'Two world leaders with opposing ideologies', setting: 'A private diplomatic meeting room', situation: 'A last-chance negotiation to prevent a global conflict — every word matters', minWords: 280 }],
  },
  timed_challenge: {
    beginner:           [{ id: 1, topic: 'My favourite animal and why I love it', minWords: 50, timeSeconds: 300 }, { id: 2, topic: 'What I did last weekend', minWords: 50, timeSeconds: 300 }],
    elementary:         [{ id: 3, topic: 'The best day of my life', minWords: 80, timeSeconds: 360 }, { id: 4, topic: 'If I could have any superpower', minWords: 80, timeSeconds: 360 }],
    intermediate:       [{ id: 5, topic: 'The advantages and disadvantages of social media', minWords: 120, timeSeconds: 480 }, { id: 6, topic: 'Should students wear school uniforms? Argue your position.', minWords: 120, timeSeconds: 480 }],
    upper_intermediate: [{ id: 7, topic: 'Is technology making us more or less connected as humans?', minWords: 150, timeSeconds: 600 }, { id: 8, topic: 'The role of education in solving poverty', minWords: 150, timeSeconds: 600 }],
    advanced:           [{ id: 9, topic: 'Critically evaluate: "Economic growth and environmental sustainability are fundamentally incompatible"', minWords: 200, timeSeconds: 720 }],
    expert:             [{ id: 10, topic: 'Analyse the tension between individual liberty and collective responsibility in modern democracies', minWords: 280, timeSeconds: 900 }],
  },
  picture_writing: {
    beginner:           [{ id: 1, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/800px-Cat03.jpg', description: 'A cat sitting by a window', task: 'Describe what you see and write a short story about this cat', minWords: 60 }],
    elementary:         [{ id: 2, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/800px-Empire_State_Building_%28aerial_view%29.jpg', description: 'New York City skyline', task: 'Describe the city and write about what life might be like there', minWords: 80 }],
    intermediate:       [{ id: 3, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', description: 'The Mona Lisa by Leonardo da Vinci', task: 'Describe the painting in detail — her expression, background, colours, and what you think she is thinking', minWords: 120 }],
    upper_intermediate: [{ id: 4, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', description: "Van Gogh's Starry Night", task: 'Analyse this painting — describe the technique, mood, symbolism, and your emotional response', minWords: 160 }],
    advanced:           [{ id: 5, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', description: "Van Gogh's Starry Night", task: 'Write a critical art analysis — discuss technique, historical context, symbolism, and cultural significance', minWords: 220 }],
    expert:             [{ id: 6, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', description: 'Renaissance Art', task: 'Write an academic essay — cover Renaissance context, technique, the subject identity debate, and global influence', minWords: 300 }],
  },
};

const TOPICS = [
  { id: 1, title: 'My Favourite Place', level: 'beginner', prompt: 'Describe your favourite place and why you love it.' },
  { id: 2, title: 'A Memorable Journey', level: 'beginner', prompt: 'Describe a memorable trip or journey you have taken.' },
  { id: 11, title: 'Technology in Daily Life', level: 'intermediate', prompt: 'How has technology changed our daily lives?' },
  { id: 21, title: 'Climate Change Solutions', level: 'advanced', prompt: 'What are the most effective solutions to climate change?' },
];

router.get('/modes', auth, (req, res) => res.json(WRITING_MODES));
router.get('/topics', auth, (req, res) => res.json(TOPICS));

router.get('/prompts/:mode', auth, async (req, res) => {
  try {
    const { mode } = req.params;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);
    const modePrompts = PROMPTS[mode];
    if (!modePrompts) return res.status(404).json({ message: 'Mode not found' });
    const prompts = modePrompts[tier] || modePrompts['intermediate'] || [];
    res.json({ prompts, tier, level: user?.level || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/vocab-suggest', auth, async (req, res) => {
  try {
    const { word, topic } = req.body;
    const prompt = `Give 4 better synonyms for "${word}" when writing about "${topic}". Return ONLY JSON: {"suggestions": [{"word": "...", "definition": "..."}]}`;
    const result = await generateJSON(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { text, topicId, mode, promptData, timeSpent } = req.body;
    if (!text || text.trim().length === 0)
      return res.status(400).json({ message: 'Please write something.' });

    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    let topicLabel = 'General Writing';
    if (mode === 'story_continuation' && promptData?.starter) topicLabel = `Story Continuation`;
    else if (mode === 'news_article' && promptData?.headline)  topicLabel = `News: ${promptData.headline}`;
    else if (mode === 'letter_email' && promptData?.format)    topicLabel = `${promptData.format}`;
    else if (mode === 'creative_scene')                        topicLabel = `Creative Scene`;
    else if (mode === 'timed_challenge' && promptData?.topic)  topicLabel = `Timed Challenge`;
    else if (mode === 'picture_writing')                       topicLabel = `Picture Writing`;
    else if (topicId) { const t = TOPICS.find(t => t.id === topicId); topicLabel = t?.title || 'Essay'; }

    const prompt = `You are an expert English language teacher. Evaluate this ${mode || 'essay'} writing by a ${tier}-level learner.
Topic: "${topicLabel}"
Text: "${text}"

Return ONLY JSON:
{
  "overallScore": <0-100>,
  "grammarScore": <0-100>,
  "vocabularyScore": <0-100>,
  "coherenceScore": <0-100>,
  "contentScore": <0-100>,
  "creativityScore": <0-100>,
  "feedback": "<2-3 sentences of encouraging specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "correctedText": "<fully corrected version>",
  "sentenceAnalysis": [{"sentence": "<exact sentence>", "status": "correct|minor|major", "note": "<brief note>"}],
  "modelAnswer": "<model response 120-180 words>",
  "vocabularyHighlights": [{"word": "<good word>", "note": "<why effective>"}, {"word": "<weak word>", "suggestion": "<better word>"}],
  "wordCount": <number>,
  "cefr": "<A1/A2/B1/B2/C1/C2>",
  "nextLevelTip": "<one specific tip to reach next CEFR level>"
}`;

    let evaluation;
    try {
      evaluation = await generateJSON(prompt);
    } catch (err) {
      evaluation = { overallScore: 70, grammarScore: 70, vocabularyScore: 70, coherenceScore: 70, contentScore: 70, creativityScore: 70, feedback: 'Good effort! Keep practising.', strengths: ['Attempted the task', 'Shows effort', 'Clear ideas'], improvements: ['Improve grammar', 'Expand vocabulary', 'Better structure'], correctedText: text, sentenceAnalysis: [], modelAnswer: '', vocabularyHighlights: [], wordCount: text.split(' ').length, cefr: 'B1', nextLevelTip: 'Use more varied sentence structures.' };
    }

    let xpEarned = Math.floor(evaluation.overallScore / 10) * 5 + 10;
    if (mode === 'timed_challenge') xpEarned += 15;
    if (mode === 'creative_scene')  xpEarned += 10;
    if (evaluation.overallScore >= 90) xpEarned += 20;
    const coinsEarned = Math.floor(xpEarned / 2);

    const activity = new Activity({ userId: req.user._id, type: 'writing', topic: topicLabel, score: evaluation.overallScore, maxScore: 100, xpEarned, coinsEarned, timeSpent: timeSpent || 0, feedback: evaluation.feedback, details: { ...evaluation, mode } });
    await activity.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned, coins: coinsEarned, 'stats.writingCompleted': 1, 'stats.totalScore': evaluation.overallScore } });
    await updateStreak(req.user._id);
    res.json({ evaluation, xpEarned, coinsEarned });
  } catch (err) {
    console.error('Writing route error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/improve', auth, async (req, res) => {
  try {
    const { sentence } = req.body;
    if (!sentence) return res.status(400).json({ message: 'No sentence provided.' });
    const prompt = `Improve this English sentence: "${sentence}". Return ONLY JSON: {"improved": "<improved sentence>", "explanation": "<what changed and why in 1 sentence>"}`;
    const result = await generateJSON(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
