import User from '../models/User.js';

/**
 * Updates streak and lastActiveDate for a user.
 * - If user completed an activity yesterday → streak + 1
 * - If user already did one today → streak unchanged
 * - If user missed a day → streak resets to 1
 */
export async function updateStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const todayStr = now.toDateString();
  const lastStr = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;

  if (lastStr === todayStr) {
    // Already active today — do nothing
    return;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  let newStreak;
  if (lastStr === yesterdayStr) {
    // Consecutive day
    newStreak = (user.streak || 0) + 1;
  } else {
    // Missed at least one day
    newStreak = 1;
  }

  await User.findByIdAndUpdate(userId, {
    streak: newStreak,
    lastActiveDate: now,
  });
}
