import express from "express";
import cors from "cors";
import { isDatabaseConnected } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";

/** Create the HTTP application without opening a port or a database connection. */
export function createApp({ clientUrl = process.env.CLIENT_URL || "http://localhost:5173" } = {}) {
  const app = express();
  const allowedOrigins = clientUrl.split(",").map((value) => value.trim()).filter(Boolean);

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin denied"));
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
    // Keep internal stack traces and environment details out of public responses.
    if (error.message === "CORS origin denied") {
      return res.status(403).json({ message: "This website origin is not allowed." });
    }
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ message: "Invalid JSON request body." });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ message: "Request body is too large." });
    }
    console.error("Unhandled server error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  });

  return app;
}

export default createApp;
