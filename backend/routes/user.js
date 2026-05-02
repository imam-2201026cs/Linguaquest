import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, avatarEmoji, avatarColor, weeklyGoal } = req.body;
    
    // Check if username is taken
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { username, bio, avatarEmoji, avatarColor, weeklyGoal } },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/public/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -email -lastActiveDate');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Also fetch their public stats
    const recentActivities = await Activity.find({ userId: user._id })
      .sort({ completedAt: -1 })
      .limit(10);
      
    res.json({ user, recentActivities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(20);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const recentActivities = await Activity.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(50);

    const weeklyXP = recentActivities
      .filter(a => {
        const diff = (Date.now() - new Date(a.completedAt)) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      })
      .reduce((sum, a) => sum + a.xpEarned, 0);

    res.json({ user, recentActivities, weeklyXP });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
