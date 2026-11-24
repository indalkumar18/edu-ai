import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Check } from "lucide-react";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";
import { apiRequest, saveSession } from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function strength(password) {
  const checks = [
    { ok: password.length >= 8, label: "At least 8 characters" },
    { ok: /[a-z]/.test(password) && /[A-Z]/.test(password), label: "Upper and lower case letters" },
    { ok: /\d/.test(password), label: "A number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "A symbol" },
  ];
  const score = checks.filter(c => c.ok).length;
  const label = !password ? "" : score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  return { checks, score: password ? Math.max(score, 1) : 0, label };
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", preferredLanguage: "English" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "Create account - EduXai"; }, []);

  const pw = strength(form.password);
  const errors = {
    name: form.name.trim().length < 2 ? "Enter your full name (at least 2 characters)." : "",
    email: !form.email ? "Enter your email address." : !EMAIL_RE.test(form.email) ? "Enter a valid email address." : "",
    password: form.password.length < 8 ? "Use at least 8 characters." : "",
  };
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const blur = event => setTouched(current => ({ ...current, [event.target.name]: true }));

  async function submit(event) {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (errors.name || errors.email || errors.password) return;
    setError(""); setLoading(true);
    try {
      const data = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify({ ...form, name: form.name.trim() }) });
      saveSession(data);
      navigate("/dashboard", { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your learning space in under a minute."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form onSubmit={submit} noValidate className="auth-form">
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" className="input" autoComplete="name" placeholder="Your name" maxLength={60}
            value={form.name} onChange={update} onBlur={blur} aria-invalid={touched.name && Boolean(errors.name)} />
          {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={update} onBlur={blur} aria-invalid={touched.email && Boolean(errors.email)} />
          {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <PasswordField id="password" label="Password" value={form.password} onChange={update} onBlur={blur}
          autoComplete="new-password" placeholder="Create a password" error={touched.password ? errors.password : ""}>
          {form.password && (
            <div className="pw-meter" aria-live="polite">
              <div className="pw-bars" data-score={pw.score}>
                {[1, 2, 3, 4].map(n => <i key={n} className={n <= pw.score ? "on" : ""} />)}
              </div>
              <span className="pw-label">{pw.label}</span>
              <ul className="pw-checks">
                {pw.checks.map(c => <li key={c.label} className={c.ok ? "ok" : ""}><Check size={12} />{c.label}</li>)}
              </ul>
            </div>
          )}
        </PasswordField>
        <div className="field">
          <span className="field-label" id="lang-label">Preferred tutor language</span>
          <div className="segmented lang-seg" role="group" aria-labelledby="lang-label">
            {["English", "Hindi"].map(lang => (
              <button type="button" key={lang} aria-pressed={form.preferredLanguage === lang}
                onClick={() => setForm(c => ({ ...c, preferredLanguage: lang }))}>{lang}</button>
            ))}
          </div>
        </div>
        {error && <div className="alert alert-error" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}
        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Creating account</> : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
