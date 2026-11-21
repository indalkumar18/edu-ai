import express from "express";
import Attempt from "../models/Attempt.js";
import protect from "../middleware/authMiddleware.js";
import requireDatabase from "../middleware/requireDatabase.js";

const router = express.Router();
router.use(protect, requireDatabase);

router.get("/me", async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user.id })
      .sort({ attemptedAt: -1 }).limit(50).lean();
    const totalQuizzes = attempts.length;
    const averageScore = totalQuizzes
      ? attempts.reduce((sum, item) => sum + (item.percentage || 0), 0) / totalQuizzes
      : 0;

    const topicMap = new Map();
    for (const attempt of attempts) {
      const current = topicMap.get(attempt.topic) || { topic: attempt.topic, attempts: 0, total: 0 };
      current.attempts += 1;
      current.total += attempt.percentage || 0;
      topicMap.set(attempt.topic, current);
    }
    const topicStats = [...topicMap.values()].map(item => ({
      topic: item.topic,
      attempts: item.attempts,
      averageScore: Number((item.total / item.attempts).toFixed(1)),
    })).sort((a, b) => a.averageScore - b.averageScore);

    return res.json({
      totalQuizzes,
      averageScore: Number(averageScore.toFixed(1)),
      topicsStudied: topicStats.length,
      weakTopics: topicStats.filter(item => item.averageScore < 60),
      strongTopics: topicStats.filter(item => item.averageScore >= 80),
      topicStats,
      recentAttempts: attempts.slice(0, 10).map(item => ({
        id: item._id,
        topic: item.topic,
        score: item.score,
        totalQuestions: item.totalQuestions,
        percentage: item.percentage,
        attemptedAt: item.attemptedAt,
      })),
    });
  } catch (error) {
    console.error("Performance error:", error.message);
    return res.status(500).json({ message: "Could not load your performance." });
  }
});

export default router;
