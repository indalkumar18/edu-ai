import { isDatabaseConnected } from "../config/db.js";

export default function requireDatabase(_req, res, next) {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      success: false,
      message: "Database is not connected. Check backend/.env and MongoDB Atlas, then restart the backend.",
    });
  }
  next();
}
