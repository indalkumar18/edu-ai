import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  selectedOption: { type: Number, default: -1 },
  correctAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  explanation: { type: String, default: "" },
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  topic: { type: String, required: true, trim: true },
  score: { type: Number, required: true, min: 0 },
  totalQuestions: { type: Number, required: true, min: 1 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  answers: { type: [answerSchema], default: [] },
  attemptedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export default mongoose.models.Attempt || mongoose.model("Attempt", attemptSchema);
