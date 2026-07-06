const Score = require('../models/Score');
const User = require('../models/User');

const toDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

exports.saveScore = async (req, res) => {
  try {
    const { wpm, accuracy, mode, duration, language, raw, consistency } = req.body;
    const score = await Score.create({
      user: req.user._id,
      wpm,
      accuracy,
      mode,
      duration,
      language: language || 'english',
      raw,
      consistency
    });

    const user = await User.findById(req.user._id);
    const today = toDay(new Date());
    const lastDay = user.lastTestDate ? toDay(user.lastTestDate) : null;
    const yesterday = today - 86400000;

    if (lastDay === null || lastDay < yesterday) {
      user.streak = 1;
    } else if (lastDay === yesterday) {
      user.streak += 1;
    }

    user.lastTestDate = new Date();
    await user.save();

    res.status(201).json({ ...score.toObject(), streak: user.streak, lastTestDate: user.lastTestDate });
  } catch (error) {
    console.error('saveScore error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const queryObj = { mode: 'time' };
    const durationParam = req.query.duration || 'overall';
    const languageParam = req.query.language || 'overall';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const PAGE_SIZE = 10;

    if (durationParam !== 'overall') {
      queryObj.duration = parseInt(durationParam);
    }
    
    if (languageParam !== 'overall') {
      if (languageParam === 'english') {
        queryObj.$or = [
          { language: 'english' },
          { language: { $exists: false } }
        ];
      } else {
        queryObj.language = languageParam;
      }
    }

    const totalCount = await Score.countDocuments(queryObj);
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);

    const scores = await Score.find(queryObj)
      .populate('user', 'username avatarSeed')
      .sort({ wpm: -1 })
      .skip((safePage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    const leaderboard = scores.map(s => ({
      id: s._id,
      username: s.user ? s.user.username : 'Unknown',
      avatarSeed: s.user ? (s.user.avatarSeed || '') : '',
      wpm: s.wpm,
      accuracy: s.accuracy,
      raw: s.raw,
      consistency: s.consistency,
      language: s.language || 'english',
      weightedScore: (s.wpm * (s.accuracy / 100)).toFixed(2),
      createdAt: s.createdAt
    }));

    leaderboard.sort((a, b) => b.weightedScore - a.weightedScore);

    res.json({ leaderboard, totalPages, currentPage: safePage });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserScores = async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUserScores = async (req, res) => {
  try {
    await Score.deleteMany({ user: req.user._id });
    res.json({ message: 'Analytics reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
