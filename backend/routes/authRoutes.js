import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import requireDatabase from "../middleware/requireDatabase.js";

const router = express.Router();
router.post("/register", requireDatabase, registerUser);
router.post("/login", requireDatabase, loginUser);
router.get("/me", protect, getMe);
export default router;
