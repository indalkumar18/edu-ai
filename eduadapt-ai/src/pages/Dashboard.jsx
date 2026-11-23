import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Brain, Target, TrendingUp, MessageCircle, ClipboardList, AlertCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { apiRequest } from "../services/api";

export default function Dashboard() {
  const [performance, setPerformance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  useEffect(() => { apiRequest("/performance/me").then(setPerformance).catch(err => setError(err.message)).finally(() => setLoading(false)); }, []);

  const chartData = [...(performance?.recentAttempts || [])].reverse().map((item, index) => ({ label: `${item.topic} ${index + 1}`, score: item.percentage }));
  const mastery = performance?.averageScore || 0;
  return <section className="page-content">
    <section className="welcome"><div><p className="eyebrow light">YOUR PERSONAL LEARNING SPACE</p><h1>Welcome back, {user.name || "Student"}! 👋</h1><p>Keep learning. Your next step is waiting for you.</p></div><div className="welcome-mark">✦</div></section>
    {error && <div className="notice notice-warning"><AlertCircle size={18}/><span>{error} Dashboard data will appear after the backend and MongoDB are connected.</span></div>}
    <section className="stats">
      <div className="stat-card"><BookOpen/><p>Topics studied</p><h2>{loading ? "—" : performance?.topicsStudied ?? 0}</h2></div>
      <div className="stat-card"><Brain/><p>Average score</p><h2>{loading ? "—" : `${mastery}%`}</h2></div>
      <div className="stat-card"><Target/><p>Quizzes completed</p><h2>{loading ? "—" : performance?.totalQuizzes ?? 0}</h2></div>
      <div className="stat-card"><TrendingUp/><p>Strong topics</p><h2>{loading ? "—" : performance?.strongTopics?.length ?? 0}</h2></div>
    </section>
    <section className="dashboard-grid">
      <div className="panel chart-panel"><div className="panel-heading"><div><h2>Learning performance</h2><p>Your latest quiz scores</p></div></div>
        {chartData.length ? <ResponsiveContainer width="100%" height={280}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0}/><YAxis domain={[0, 100]}/><Tooltip/><Bar dataKey="score" name="Score %" fill="#6855d9" radius={[6, 6, 0, 0]}/></BarChart></ResponsiveContainer> : <div className="empty-state"><p>Your quiz chart will appear here after your first assessment.</p><Link to="/assessment" className="text-link">Take your first quiz</Link></div>}
      </div>
      <div className="panel"><h2>Topics to focus on</h2><p className="muted">Based on your quiz results</p>
        {performance?.weakTopics?.length ? performance.weakTopics.slice(0, 5).map(item => <div className="topic-row" key={item.topic}><span>{item.topic}</span><strong className="weak">{item.averageScore}% · Practice</strong></div>) : <div className="empty-state compact">No weak topics yet. Complete a quiz to get a recommendation.</div>}
        <h2 className="subheading">Strong topics</h2>
        {performance?.strongTopics?.length ? performance.strongTopics.slice(0, 5).map(item => <div className="topic-row" key={item.topic}><span>{item.topic}</span><strong className="good">{item.averageScore}% · Strong</strong></div>) : <div className="empty-state compact">Your strong topics will appear here.</div>}
      </div>
    </section>
    <section className="quick-actions"><Link to="/tutor" className="action-card"><MessageCircle/><div><strong>Ask your AI Tutor</strong><span>Get a concept explained in your language.</span></div></Link><Link to="/assessment" className="action-card"><ClipboardList/><div><strong>Take an assessment</strong><span>Check what you know and what to practice.</span></div></Link></section>
  </section>;
}
