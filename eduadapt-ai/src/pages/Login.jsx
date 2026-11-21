import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function update(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try { const data = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(form) }); saveSession(data); navigate("/dashboard", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return <div className="auth-page"><div className="auth-card">
    <div className="auth-brand"><span className="brand-icon">✦</span><span>EduAdapt AI</span></div>
    <p className="eyebrow">YOUR PERSONAL LEARNING COMPANION</p><h1>Welcome back</h1><p className="auth-subtitle">Log in to continue your learning journey.</p>
    <form onSubmit={submit}>
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com" required/>
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={update} placeholder="Enter your password" required/>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="primary-btn full-width" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
    </form>
    <p className="auth-footer">New to EduAdapt AI? <Link to="/register">Create an account</Link></p>
  </div></div>;
}
