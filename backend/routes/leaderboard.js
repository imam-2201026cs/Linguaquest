import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { period = 'all', module = 'all' } = req.query;

    let usersList = [];

    // If fetching all-time overall, we can just use the User collection's total XP.
    // However, for module-specific or time-restricted leaderboards, we must aggregate Activities.
    if (period === 'all' && module === 'all') {
      const users = await User.find({}).select('username xp level streak stats createdAt country').sort({ xp: -1 }).lean();
      usersList = users.map((u, i) => ({
        rank: i + 1,
        userId: u._id,
        username: u.username,
        xp: u.xp,
        level: u.level,
        streak: u.streak,
        country: u.country || '🌍',
        totalActivities: (u.stats?.writingCompleted||0) + (u.stats?.listeningCompleted||0) + (u.stats?.readingCompleted||0) + (u.stats?.grammarChecked||0),
        isCurrentUser: u._id.toString() === req.user._id.toString()
      }));
    } else {
      // Aggregation based on Activity collection
      const matchStage = {};
      if (module !== 'all') {
        matchStage.type = module;
      }
      if (period !== 'all') {
        const now = new Date();
        const past = new Date();
        if (period === 'week') past.setDate(now.getDate() - 7);
        if (period === 'month') past.setMonth(now.getMonth() - 1);
        matchStage.completedAt = { $gte: past };
      }

      const agg = await Activity.aggregate([
        { $match: matchStage },
        { $group: { _id: '$userId', totalXp: { $sum: '$xpEarned' }, count: { $sum: 1 } } },
        { $sort: { totalXp: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ]);

      usersList = agg.map((a, i) => ({
        rank: i + 1,
        userId: a._id,
        username: a.user.username,
        xp: a.totalXp, // only XP from this period/module
        level: a.user.level,
        streak: a.user.streak,
        country: a.user.country || '🌍',
        totalActivities: a.count,
        isCurrentUser: a._id.toString() === req.user._id.toString()
      }));
    }

    // Add pseudo-random deterministic rank changes for demo purposes (since we don't snapshot historical ranks)
    usersList = usersList.map(u => {
      // Create a stable random number based on user id and current date so it doesn't flicker on every fetch
      const dateNum = new Date().getDate();
      const hash = String(u.username).charCodeAt(0) + dateNum;
      const rankChange = (hash % 5) - 2; // Returns -2 to +2
      return { ...u, rankChange };
    });

    res.json(usersList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Challenge user route (dummy endpoint that just returns success)
router.post('/challenge/:userId', auth, async (req, res) => {
  // In a real app, this would create a notification record for the challenged user
  res.json({ message: 'Challenge sent successfully!' });
});

export default router;
