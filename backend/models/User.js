import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  preferredLanguage: { type: String, enum: ["English", "Hindi"], default: "English" },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
