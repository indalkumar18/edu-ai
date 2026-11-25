import express from "express";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";
import protect from "../middleware/authMiddleware.js";
import { feedbackFor, gradeQuestions } from "../utils/grading.js";
import requireDatabase from "../middleware/requireDatabase.js";
import { validateAssessmentSubmission, validateSelectionsAgainstQuestions } from "../utils/assessmentValidation.js";

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
    const topic = String(req.params.topic || "").trim();
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
    const validation = validateAssessmentSubmission(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const { topic, answers: normalizedAnswers } = validation.value;
    const ids = normalizedAnswers.map(item => item.questionId);

    const questions = await Question.find({ _id: { $in: ids }, topic });
    if (questions.length !== ids.length) return res.status(400).json({ message: "Some submitted questions are invalid." });

    const selectionValidation = validateSelectionsAgainstQuestions(normalizedAnswers, questions);
    if (selectionValidation.error) {
      return res.status(400).json({ message: selectionValidation.error });
    }

    const answerMap = new Map(normalizedAnswers.map(item => [item.questionId, item.selectedOption]));
    const { gradedAnswers, score, totalQuestions, percentage } = gradeQuestions(questions, answerMap);
    const attempt = await Attempt.create({
      userId: req.user.id, topic, score, totalQuestions, percentage, answers: gradedAnswers,
    });

    const gradedByQuestionId = new Map(gradedAnswers.map(answer => [String(answer.questionId), answer]));
    const result = questions.map(question => {
      const answer = gradedByQuestionId.get(String(question._id));
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
      feedback: feedbackFor(percentage),
      results: result,
    });
  } catch (error) {
    console.error("Quiz submit error:", error.message);
    return res.status(500).json({ message: "Could not submit this quiz. Please try again." });
  }
});

export default router;
