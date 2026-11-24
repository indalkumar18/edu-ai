import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, BookOpen, ClipboardList, MessageSquare, Target, TrendingUp, Gauge } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { apiRequest } from "../services/api";

function readUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function TopicList({ items, tone, empty }) {
  if (!items?.length) return <p className="list-empty">{empty}</p>;
  return (
    <ul className="topic-list">
      {items.slice(0, 5).map(item => (
        <li key={item.topic}>
          <span>{item.topic}</span>
          <div className="mini-track"><i className={tone} style={{ width: `${item.averageScore}%` }} /></div>
          <b>{item.averageScore}%</b>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const [performance, setPerformance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = readUser();

  useEffect(() => {
    document.title = "Dashboard - EduXai";
    apiRequest("/performance/me").then(setPerformance).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const chartData = [...(performance?.recentAttempts || [])].reverse().map((item, index) => ({ label: `${item.topic} ${index + 1}`, score: item.percentage }));
  const val = v => (loading ? "-" : v);
  const firstName = (user.name || "there").split(" ")[0];

  return (
    <section className="page">
      <header className="page-head row">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{greeting()}, {firstName}</h1>
          <p>Here is where your learning stands today.</p>
        </div>
        <div className="head-actions">
          <Link to="/tutor" className="btn btn-secondary"><MessageSquare size={16} /> Ask the tutor</Link>
          <Link to="/assessment" className="btn btn-primary">Take a quiz <ArrowRight size={16} /></Link>
        </div>
      </header>

      {error && <div className="alert alert-warn"><AlertCircle size={16} /><span>{error} Your stats will appear once the backend and database are connected.</span></div>}

      <div className="stat-grid">
        <div className="stat"><span className="stat-icon"><BookOpen size={17} /></span><p>Topics studied</p><b>{val(performance?.topicsStudied ?? 0)}</b></div>
        <div className="stat"><span className="stat-icon"><Gauge size={17} /></span><p>Average score</p><b>{val(`${performance?.averageScore ?? 0}%`)}</b></div>
        <div className="stat"><span className="stat-icon"><Target size={17} /></span><p>Quizzes completed</p><b>{val(performance?.totalQuizzes ?? 0)}</b></div>
        <div className="stat"><span className="stat-icon"><TrendingUp size={17} /></span><p>Strong topics</p><b>{val(performance?.strongTopics?.length ?? 0)}</b></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Recent quiz scores</h2><span className="muted">Last {chartData.length || 0} attempts</span></div>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#e4e0d5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7a838a" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#7a838a" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(15,92,70,0.06)" }} contentStyle={{ borderRadius: 10, border: "1px solid #e4e0d5", boxShadow: "none", fontSize: 13 }} />
                <Bar dataKey="score" name="Score %" fill="#0f5c46" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-inline">
              <ClipboardList size={22} />
              <p>Your scores will chart here after your first assessment.</p>
              <Link to="/assessment" className="btn btn-secondary btn-sm">Take your first quiz</Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h2>Focus areas</h2></div>
          <p className="sub-label">Needs practice</p>
          <TopicList items={performance?.weakTopics} tone="bad" empty="No weak topics yet. Complete a quiz to get recommendations." />
          <p className="sub-label">Doing well</p>
          <TopicList items={performance?.strongTopics} tone="good" empty="Topics you score 80% or more on will show here." />
        </div>
      </div>

      <div className="action-grid">
        <Link to="/tutor" className="action">
          <span className="stat-icon"><MessageSquare size={18} /></span>
          <div><strong>Ask your AI tutor</strong><span>Get any concept explained in English or Hindi.</span></div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/assessment" className="action">
          <span className="stat-icon"><ClipboardList size={18} /></span>
          <div><strong>Take an assessment</strong><span>Check what you know and what to revise.</span></div>
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
