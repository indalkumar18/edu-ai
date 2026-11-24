import { Check } from "lucide-react";
import Logo from "./Logo";
import "../styles/auth.css";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo light />
        <div className="auth-side-body">
          <h2>Understand it properly, then prove it.</h2>
          <ul>
            <li><Check size={16} /><span><b>A tutor on demand.</b> Ask follow-ups in English or Hindi until it clicks.</span></li>
            <li><Check size={16} /><span><b>Quizzes with reasoning.</b> Every answer is explained, not just marked.</span></li>
            <li><Check size={16} /><span><b>Clear progress.</b> See which topics need your attention next.</span></li>
          </ul>
        </div>
        <p className="auth-side-foot">AI can make mistakes. Check important answers against your notes.</p>
      </aside>
      <main className="auth-main">
        <div className="auth-top"><Logo /></div>
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}
