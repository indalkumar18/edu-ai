import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";

export default async function protect(req, res, next) {
  if (!isDatabaseConnected()) {
    return res.status(503).json({ message: "Database is not connected. Please check MongoDB Atlas settings." });
  }

  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name email preferredLanguage");

    if (!user) {
      return res.status(401).json({ message: "This account was not found. Please log in again." });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your login session is invalid or expired. Please log in again." });
  }
}
