import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const STYLE_INSTRUCTIONS = {
  beginner: "Use very simple language. Explain one step at a time and give a small everyday example.",
  exam: "Give an exam-ready answer with a definition, headings, key points and a short conclusion.",
  advanced: "Give a detailed technical explanation, assumptions, examples and practical applications.",
};

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

// Validates the request and builds the Groq payload. Returns { error } or { messages, validLanguage, style }.
function prepare(req) {
  const { question, language = "English", style = "beginner", history = [] } = req.body || {};

  if (typeof question !== "string" || !question.trim()) {
    return { error: { status: 400, message: "Please type a question first." } };
  }
  if (question.length > 3000) {
    return { error: { status: 400, message: "Question is too long. Keep it under 3000 characters." } };
  }
  if (!process.env.GROQ_API_KEY) {
    return { error: { status: 503, message: "Groq API key is missing. Add GROQ_API_KEY to backend/.env." } };
  }

  const validLanguage = ["English", "Hindi"].includes(language) ? language : "English";
  const selectedStyle = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.beginner;

  const recentHistory = Array.isArray(history)
    ? history.slice(-8).map((item) => ({
        role: item?.role === "model" || item?.role === "assistant" ? "assistant" : "user",
        content: String(item?.text || "").slice(0, 2500),
      }))
    : [];

  const messages = [
    {
      role: "system",
      content: `You are EduXai, a patient personal tutor for school and university students.

Reply only in ${validLanguage}.

${selectedStyle}

Instructions:
- Format answers in Markdown. Use short headings, lists and fenced code blocks (with a language tag) where they help.
- Explain concepts step by step.
- If the question is ambiguous, state your assumption.
- Do not invent facts. If unsure, say so clearly.
- Do not claim to have checked a student's records.`,
    },
    ...recentHistory,
    { role: "user", content: question.trim() },
  ];

  return { messages, validLanguage, style };
}

function mapError(error) {
  const status = Number(error?.status || error?.statusCode);
  if (status === 401 || status === 403) return { status: 502, message: "Groq API key was rejected. Check your API key." };
  if (status === 429) return { status: 429, message: "Groq request limit reached. Please try again later." };
  return { status: 502, message: error?.message || "AI Tutor could not get a response. Please try again." };
}

const completionOptions = (messages) => ({
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  messages,
  temperature: 0.4,
  max_tokens: 1800,
});

router.get("/health", (_req, res) => {
  res.json({ configured: Boolean(process.env.GROQ_API_KEY), provider: "Groq" });
});

// Non-streaming answer (kept for compatibility).
router.post("/teach", async (req, res) => {
  const prepared = prepare(req);
  if (prepared.error) return fail(res, prepared.error.status, prepared.error.message);

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create(completionOptions(prepared.messages));
    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) throw new Error("Groq returned an empty answer. Please try again.");
    return res.json({ success: true, answer, language: prepared.validLanguage, style: prepared.style });
  } catch (error) {
    console.error("Groq API Error:", error?.message || error);
    const mapped = mapError(error);
    return fail(res, mapped.status, mapped.message);
  }
});

// Streaming answer using Server-Sent Events. Each event is `data: {"token": "..."}`,
// followed by a final `data: {"done": true}` or `data: {"error": "..."}`.
router.post("/teach/stream", async (req, res) => {
  const prepared = prepare(req);
  if (prepared.error) return fail(res, prepared.error.status, prepared.error.message);

  let stream;
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    stream = await groq.chat.completions.create({ ...completionOptions(prepared.messages), stream: true });
  } catch (error) {
    console.error("Groq stream start error:", error?.message || error);
    const mapped = mapError(error);
    return fail(res, mapped.status, mapped.message);
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
  let closed = false;
  res.on("close", () => {
    closed = true;
    try { stream.controller?.abort(); } catch { /* ignore */ }
  });

  try {
    let produced = false;
    for await (const chunk of stream) {
      if (closed) break;
      const token = chunk.choices?.[0]?.delta?.content;
      if (token) { produced = true; send({ token }); }
    }
    if (!closed) {
      if (!produced) send({ error: "The tutor returned an empty answer. Please try again." });
      else send({ done: true });
    }
  } catch (error) {
    if (!closed) {
      console.error("Groq stream error:", error?.message || error);
      send({ error: mapError(error).message });
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
});

export default router;
