import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  topic: { type: String, required: true, trim: true, index: true },
  question: { type: String, required: true, trim: true },
  options: { type: [String], required: true, validate: value => value.length >= 2 },
  correctAnswer: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: "" },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model("Question", questionSchema);
