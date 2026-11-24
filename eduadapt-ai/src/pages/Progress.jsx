import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { apiRequest } from "../services/api";

const tone = value => (value >= 80 ? "good" : value >= 60 ? "mid" : "bad");

export default function Progress() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Progress - EduXai";
    apiRequest("/performance/me").then(setData).catch(err => setError(err.message));
  }, []);

  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">Progress</p>
        <h1>Your learning record</h1>
        <p>Quiz history and topic-wise performance in one place.</p>
      </header>

      {error && <div className="alert alert-error" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}
      {!data && !error && <div className="card skeleton-card" />}

      {data && (
        <>
          <div className="stat-grid three">
            <div className="stat"><p>Total quizzes</p><b>{data.totalQuizzes}</b></div>
            <div className="stat"><p>Average score</p><b>{data.averageScore}%</b></div>
            <div className="stat"><p>Topics studied</p><b>{data.topicsStudied}</b></div>
          </div>

          <div className="card">
            <div className="card-head"><h2>Topic performance</h2></div>
            {data.topicStats?.length ? (
              <ul className="topic-list wide">
                {[...data.topicStats].sort((a, b) => b.averageScore - a.averageScore).map(item => (
                  <li key={item.topic}>
                    <span>{item.topic}</span>
                    <div className="mini-track"><i className={tone(item.averageScore)} style={{ width: `${item.averageScore}%` }} /></div>
                    <b>{item.averageScore}%</b>
                  </li>
                ))}
              </ul>
            ) : <p className="list-empty">Take a quiz to see topic performance.</p>}
          </div>

          <div className="card">
            <div className="card-head"><h2>Quiz history</h2></div>
            {data.recentAttempts.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Topic</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
                  <tbody>
                    {data.recentAttempts.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.topic}</strong></td>
                        <td>{item.score} / {item.totalQuestions}</td>
                        <td><span className={`badge ${tone(item.percentage)}`}>{item.percentage}%</span></td>
                        <td className="muted">{new Date(item.attemptedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-inline">
                <p>No quizzes attempted yet.</p>
                <Link to="/assessment" className="btn btn-secondary btn-sm">Start a quiz</Link>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
