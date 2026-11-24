import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";
import { apiRequest, saveSession } from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "Log in - EduXai"; }, []);

  const errors = {
    email: !form.email ? "Enter your email address." : !EMAIL_RE.test(form.email) ? "Enter a valid email address." : "",
    password: !form.password ? "Enter your password." : "",
  };
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const blur = event => setTouched(current => ({ ...current, [event.target.name]: true }));

  async function submit(event) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;
    setError(""); setLoading(true);
    try {
      const data = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(form) });
      saveSession(data);
      navigate("/dashboard", { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue where you left off."
      footer={<>New to EduXai? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={submit} noValidate className="auth-form">
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={update} onBlur={blur}
            aria-invalid={touched.email && Boolean(errors.email)} />
          {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <PasswordField id="password" label="Password" value={form.password} onChange={update} onBlur={blur}
          autoComplete="current-password" placeholder="Enter your password" error={touched.password ? errors.password : ""} />
        {error && <div className="alert alert-error" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}
        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Logging in</> : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
