import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import writingRoutes from './routes/writing.js';
import listeningRoutes from './routes/listening.js';
import readingRoutes from './routes/reading.js';
import grammarRoutes from './routes/grammar.js';
import leaderboardRoutes from './routes/leaderboard.js';
import vocabularyRoutes from './routes/vocabulary.js';
import challengeRoutes from './routes/challenge.js';
import conversationRoutes from './routes/conversation.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://linguaquest.vercel.app',
    'https://linguaquest-imam-2201026cs.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/conversation', conversationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'English Learning API is running!' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
