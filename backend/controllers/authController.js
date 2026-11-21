import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function createToken(userId) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters. Update backend/.env.");
  }
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function safeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
  };
}

export async function registerUser(req, res) {
  try {
    const { name, email, password, preferredLanguage = "English" } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    if (!["English", "Hindi"].includes(preferredLanguage)) {
      return res.status(400).json({ message: "Choose English or Hindi as your language." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: "This email is already registered. Please log in." });

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      preferredLanguage,
    });

    return res.status(201).json({ message: "Account created successfully.", token: createToken(user._id), user: safeUser(user) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "This email is already registered." });
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Could not create the account. Please try again." });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    return res.json({ message: "Login successful.", token: createToken(user._id), user: safeUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Could not log in. Please try again." });
  }
}

export async function getMe(req, res) {
  return res.json({ user: req.user });
}
