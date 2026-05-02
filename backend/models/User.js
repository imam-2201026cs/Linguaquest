import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  icon: String,
  unlockedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  bio: { type: String, default: 'English learner on LinguaQuest!' },
  avatarEmoji: { type: String, default: '👤' },
  avatarColor: { type: String, default: 'from-primary-500 to-accent-purple' },
  weeklyGoal: { type: Number, default: 500 }, // XP goal
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  coins: { type: Number, default: 0 },
  achievements: [achievementSchema],
  stats: {
    writingCompleted: { type: Number, default: 0 },
    listeningCompleted: { type: Number, default: 0 },
    readingCompleted: { type: Number, default: 0 },
    grammarChecked: { type: Number, default: 0 },
    conversationsCompleted: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    avgAccuracy: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.addXP = async function(amount) {
  this.xp += amount;
  this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  await this.save();
};

export default mongoose.model('User', userSchema);
