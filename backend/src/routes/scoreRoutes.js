const express = require('express');
const { saveScore, getLeaderboard, getUserScores, deleteUserScores } = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, saveScore);
router.get('/leaderboard', getLeaderboard);
router.get('/me', protect, getUserScores);
router.delete('/me', protect, deleteUserScores);

module.exports = router;
