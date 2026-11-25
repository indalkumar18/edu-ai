import "dotenv/config";
import { pathToFileURL } from "node:url";
import connectDB from "./config/db.js";
import { createApp } from "./app.js";

export const app = createApp();

export async function startServer() {
  const port = Number(process.env.PORT || 5000);
  const server = app.listen(port, async () => {
    console.log(`EduXai backend running at http://localhost:${port}`);
    try {
      await connectDB();
    } catch (error) {
      console.error(`[MongoDB] ${error.message}`);
      console.error("The server will stay on so the AI Tutor can still be tested. Login, quiz and progress need a working MongoDB connection.");
    }
  });
  return server;
}

// Importing this file in tests must not start a server or connect to MongoDB.
const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) startServer();
