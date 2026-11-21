import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Send, RotateCcw } from "lucide-react";
import { apiRequest } from "../services/api";

export default function Tutor() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("English");
  const [style, setStyle] = useState("beginner");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askAI(event) {
    event.preventDefault();
    if (!question.trim() || loading) return;
    const currentQuestion = question.trim();
    const previous = messages.slice(-6).map(item => ({ role: item.role === "assistant" ? "model" : "user", text: item.text }));
    setMessages(items => [...items, { role: "user", text: currentQuestion }]);
    setQuestion(""); setError(""); setLoading(true);
    try {
      const data = await apiRequest("/ai/teach", { method: "POST", body: JSON.stringify({ question: currentQuestion, language, style, history: previous }) });
      setMessages(items => [...items, { role: "assistant", text: data.answer }]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return <section className="page-content">
    <div className="page-heading"><div><p className="eyebrow">PERSONAL AI TEACHER</p><h1>AI Tutor <Bot size={28}/></h1><p>Ask a question. Choose how you want it explained.</p></div></div>
    <div className="tutor-panel">
      <div className="tutor-controls">
        <label>Language<select value={language} onChange={e => setLanguage(e.target.value)}><option>English</option><option>Hindi</option></select></label>
        <label>Explanation style<select value={style} onChange={e => setStyle(e.target.value)}><option value="beginner">Simple explanation</option><option value="exam">Exam answer</option><option value="advanced">Detailed / advanced</option></select></label>
        <button className="text-button" onClick={() => { setMessages([]); setError(""); }}><RotateCcw size={15}/> Clear chat</button>
      </div>
      <div className="chat-window" aria-live="polite">
        {messages.length === 0 && <div className="empty-chat"><div className="empty-chat-icon"><Bot size={32}/></div><h2>What would you like to learn?</h2><p>Try: “Explain DBMS normalization with an example.”</p></div>}
        {messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}><strong>{message.role === "user" ? "You" : "EduAdapt AI"}</strong><p>{message.text}</p></div>)}
        {loading && <div className="chat-message assistant"><strong>EduAdapt AI</strong><p className="typing">Thinking and preparing your explanation...</p></div>}
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <form className="tutor-form" onSubmit={askAI}>
        <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask your study question..." rows={3} maxLength={3000}/>
        <div className="form-bottom"><span>{question.length}/3000 characters</span><button className="primary-btn" disabled={loading || !question.trim()} type="submit">{loading ? "Please wait..." : "Ask AI Tutor"} <Send size={16}/></button></div>
      </form>
    </div>
    <p className="page-footnote">AI can make mistakes. Check important answers with your class notes or textbook.</p>
    <Link className="back-link" to="/dashboard">Back to dashboard</Link>
  </section>;
}
