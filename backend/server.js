
import dns from "node:dns";
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB, { isDatabaseConnected } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";


dns.setServers(["8.8.8.8", "8.8.4.4"]);


const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map(value => value.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`This origin is not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => res.send("EduXai API is running."));
app.get("/api/health", (_req, res) => res.json({
  status: "ok",
  service: "EduXai API",
  database: isDatabaseConnected() ? "connected" : "disconnected",
  groqConfigured: Boolean(process.env.GROQ_API_KEY),
}));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/performance", performanceRoutes);

app.use((_req, res) => res.status(404).json({ message: "API route not found." }));
app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error.message);
  if (error.message?.startsWith("This origin is not allowed by CORS")) {
    return res.status(403).json({ message: error.message });
  }
  if (error.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON request body." });
  if (error.type === "entity.too.large") return res.status(413).json({ message: "Request body is too large." });
  return res.status(500).json({ message: "Internal server error." });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, async () => {
  console.log(`EduXai backend running at http://localhost:${port}`);
  try {
    await connectDB();
  } catch (error) {
    console.error(`[MongoDB] ${error.message}`);
    console.error("The server will stay on so the AI Tutor can still be tested. Login, quiz and progress need a working MongoDB connection.");
  }
});
