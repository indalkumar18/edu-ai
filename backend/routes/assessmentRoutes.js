import express from "express";
import mongoose from "mongoose";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";
import protect from "../middleware/authMiddleware.js";
import requireDatabase from "../middleware/requireDatabase.js";

const router = express.Router();
router.use(protect, requireDatabase);

router.get("/topics", async (_req, res) => {
  try {
    const topics = await Question.distinct("topic");
    return res.json({ topics: topics.sort((a, b) => a.localeCompare(b)) });
  } catch (error) {
    return res.status(500).json({ message: "Could not load quiz topics." });
  }
});

router.get("/questions/:topic", async (req, res) => {
  try {
    const topic = decodeURIComponent(req.params.topic).trim();
    const questions = await Question.find({ topic }).sort({ _id: 1 }).limit(20)
      .select("topic question options difficulty");
    if (!questions.length) return res.status(404).json({ message: "No questions found for this topic. Run npm run seed in backend first." });
    return res.json({ questions });
  } catch (error) {
    return res.status(500).json({ message: "Could not load questions." });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const { topic, answers } = req.body || {};
    if (!topic || !Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ message: "Topic and answers are required." });
    }
    const normalizedAnswers = answers.filter(item => item && mongoose.isValidObjectId(item.questionId));
    const ids = normalizedAnswers.map(item => item.questionId);
    if (!ids.length) return res.status(400).json({ message: "No valid answers were submitted." });

    const questions = await Question.find({ _id: { $in: ids }, topic });
    if (questions.length !== ids.length) return res.status(400).json({ message: "Some submitted questions are invalid." });

    const answerMap = new Map(normalizedAnswers.map(item => [String(item.questionId), Number(item.selectedOption)]));
    const gradedAnswers = questions.map(question => {
      const selectedOption = answerMap.has(String(question._id)) ? answerMap.get(String(question._id)) : -1;
      const isCorrect = Number.isInteger(selectedOption) && selectedOption === question.correctAnswer;
      return {
        questionId: question._id,
        selectedOption,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || "",
      };
    });

    const score = gradedAnswers.filter(answer => answer.isCorrect).length;
    const totalQuestions = gradedAnswers.length;
    const percentage = Number(((score / totalQuestions) * 100).toFixed(2));
    const attempt = await Attempt.create({
      userId: req.user.id, topic, score, totalQuestions, percentage, answers: gradedAnswers,
    });

    const result = questions.map(question => {
      const answer = gradedAnswers.find(item => String(item.questionId) === String(question._id));
      return {
        questionId: question._id,
        question: question.question,
        options: question.options,
        selectedOption: answer.selectedOption,
        correctAnswer: question.correctAnswer,
        isCorrect: answer.isCorrect,
        explanation: question.explanation,
      };
    });

    return res.json({
      message: "Quiz submitted successfully.", attemptId: attempt._id,
      topic, score, totalQuestions, percentage,
      feedback: percentage >= 80 ? "Great work! You understand this topic well." : percentage >= 50 ? "Good attempt. Revise the questions you missed and try again." : "Let's review the basics of this topic and practise once more.",
      results: result,
    });
  } catch (error) {
    console.error("Quiz submit error:", error.message);
    return res.status(500).json({ message: "Could not submit this quiz. Please try again." });
  }
});

export default router;
