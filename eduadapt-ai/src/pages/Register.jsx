import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", preferredLanguage: "English" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function update(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try { const data = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(form) }); saveSession(data); navigate("/dashboard", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return <div className="auth-page"><div className="auth-card">
    <div className="auth-brand"><span className="brand-icon">✦</span><span>EduAdapt AI</span></div>
    <p className="eyebrow">START LEARNING YOUR WAY</p><h1>Create your account</h1><p className="auth-subtitle">Your personal learning space is one step away.</p>
    <form onSubmit={submit}>
      <label htmlFor="name">Full name</label><input id="name" name="name" value={form.name} onChange={update} placeholder="Your name" minLength={2} maxLength={60} required/>
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com" required/>
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={update} placeholder="At least 8 characters" minLength={8} required/>
      <label htmlFor="preferredLanguage">Preferred language</label><select id="preferredLanguage" name="preferredLanguage" value={form.preferredLanguage} onChange={update}><option>English</option><option>Hindi</option></select>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="primary-btn full-width" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
    </form>
    <p className="auth-footer">Already have an account? <Link to="/login">Log in</Link></p>
  </div></div>;
}
