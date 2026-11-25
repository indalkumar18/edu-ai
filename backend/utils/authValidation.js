const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGUAGES = new Set(["English", "Hindi"]);

export function validateRegistration(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Please provide valid registration details." };
  }

  const { name, email, password, preferredLanguage = "English" } = body;
  if (typeof name !== "string" || !name.trim()
    || typeof email !== "string" || !email.trim()
    || typeof password !== "string" || !password) {
    return { error: "Name, email and password are required." };
  }
  if (name.trim().length < 2 || name.trim().length > 60) {
    return { error: "Name must be between 2 and 60 characters." };
  }
  if (email.trim().length > 254 || !EMAIL_RE.test(email.trim())) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  // bcrypt only uses the first 72 UTF-8 bytes; reject longer passwords rather
  // than silently treating different passwords as identical.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return { error: "Password must not exceed 72 bytes." };
  }
  if (!LANGUAGES.has(preferredLanguage)) {
    return { error: "Choose English or Hindi as your language." };
  }

  return {
    value: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      preferredLanguage,
    },
  };
}

export function validateLogin(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Please provide valid login details." };
  }
  const { email, password } = body;
  if (typeof email !== "string" || !email.trim()
    || typeof password !== "string" || !password) {
    return { error: "Email and password are required." };
  }
  if (email.trim().length > 254 || !EMAIL_RE.test(email.trim())) {
    return { error: "Please enter a valid email address." };
  }
  return { value: { email: email.trim().toLowerCase(), password } };
}
