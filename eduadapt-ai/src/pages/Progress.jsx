import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function Progress() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { apiRequest("/performance/me").then(setData).catch(err => setError(err.message)); }, []);
  return <section className="page-content"><div className="page-heading"><div><p className="eyebrow">YOUR LEARNING RECORD</p><h1>My Progress</h1><p>See your quiz history and topic-wise performance.</p></div></div>
    {error && <div className="form-error">{error}</div>}{!data && !error && <p>Loading your progress...</p>}
    {data && <><div className="stats"><div className="stat-card"><p>Total quizzes</p><h2>{data.totalQuizzes}</h2></div><div className="stat-card"><p>Average score</p><h2>{data.averageScore}%</h2></div><div className="stat-card"><p>Topics studied</p><h2>{data.topicsStudied}</h2></div></div>
      <div className="panel"><h2>Quiz history</h2>{data.recentAttempts.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Topic</th><th>Score</th><th>Percentage</th><th>Date</th></tr></thead><tbody>{data.recentAttempts.map(item => <tr key={item.id}><td>{item.topic}</td><td>{item.score}/{item.totalQuestions}</td><td>{item.percentage}%</td><td>{new Date(item.attemptedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="empty-state">No quizzes attempted yet.</div>}</div>
      <div className="dashboard-grid"><div className="panel"><h2>Needs practice</h2>{data.weakTopics.length ? data.weakTopics.map(item => <div className="topic-row" key={item.topic}><span>{item.topic}</span><strong className="weak">{item.averageScore}%</strong></div>) : <p className="muted">No topics need extra practice yet.</p>}</div><div className="panel"><h2>Doing well</h2>{data.strongTopics.length ? data.strongTopics.map(item => <div className="topic-row" key={item.topic}><span>{item.topic}</span><strong className="good">{item.averageScore}%</strong></div>) : <p className="muted">Your strong topics will appear after quizzes.</p>}</div></div>
    </>}
  </section>;
}
