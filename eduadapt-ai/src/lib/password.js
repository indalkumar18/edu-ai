export function strength(password) {
  const checks = [
    { ok: password.length >= 8, label: "At least 8 characters" },
    { ok: /[a-z]/.test(password) && /[A-Z]/.test(password), label: "Upper and lower case letters" },
    { ok: /\d/.test(password), label: "A number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "A symbol" },
  ];
  const score = checks.filter((c) => c.ok).length;
  const label = !password ? "" : score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  return { checks, score: password ? Math.max(score, 1) : 0, label };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
