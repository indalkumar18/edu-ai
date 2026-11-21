import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({
    configured: Boolean(process.env.GROQ_API_KEY),
    provider: "Groq",
  });
});

router.post("/teach", async (req, res) => {
  try {
    const {
      question,
      language = "English",
      style = "beginner",
      history = [],
    } = req.body || {};

    // Validate question
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please type a question first.",
      });
    }

    if (question.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Question is too long. Keep it under 3000 characters.",
      });
    }

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Groq API key is missing. Add GROQ_API_KEY to backend/.env.",
      });
    }

    const validLanguage = ["English", "Hindi"].includes(language)
      ? language
      : "English";

    // Teaching styles
    const styleInstructions = {
      beginner:
        "Use very simple language. Explain one step at a time and give a small everyday example.",

      exam:
        "Give an exam-ready answer with a definition, headings, key points and a short conclusion.",

      advanced:
        "Give a detailed technical explanation, assumptions, examples and practical applications.",
    };

    const selectedStyle =
      styleInstructions[style] || styleInstructions.beginner;

    // Prepare conversation history
    const recentHistory = Array.isArray(history)
      ? history.slice(-6).map((item) => ({
          role: item?.role === "model" || item?.role === "assistant"
            ? "assistant"
            : "user",
          content: String(item?.text || "").slice(0, 1500),
        }))
      : [];

    // Initialize Groq
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Generate AI response
    const completion = await groq.chat.completions.create({
      model:
        process.env.GROQ_MODEL || "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are EduAdapt AI, a patient personal tutor for school and university students.

Reply only in ${validLanguage}.

${selectedStyle}

Instructions:
- Use clear headings and examples when useful.
- Explain concepts step by step.
- If the question is ambiguous, state your assumption.
- Do not invent facts.
- If unsure, clearly say so.
- Do not claim to have checked a student's records.
          `,
        },

        ...recentHistory,

        {
          role: "user",
          content: question.trim(),
        },
      ],

      temperature: 0.4,
      max_tokens: 1800,
    });

    const answer =
      completion.choices[0]?.message?.content?.trim();

    if (!answer) {
      throw new Error(
        "Groq returned an empty answer. Please try again."
      );
    }

    return res.json({
      success: true,
      answer,
      language: validLanguage,
      style,
    });

  } catch (error) {
    console.error("Groq API Error:", error);

    const status = Number(error?.status || error?.statusCode);

    if (status === 401 || status === 403) {
      return res.status(502).json({
        success: false,
        message: "Groq API key was rejected. Check your API key.",
      });
    }

    if (status === 429) {
      return res.status(429).json({
        success: false,
        message: "Groq request limit reached. Please try again later.",
      });
    }

    return res.status(502).json({
      success: false,
      message:
        error.message ||
        "AI Tutor could not get a response. Please try again.",
    });
  }
});

export default router;