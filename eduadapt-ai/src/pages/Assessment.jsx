import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, ArrowLeft, ArrowRight, BookOpen, Braces, Check, Clock, Database, Flag, Globe, Layers, RotateCcw, X,
} from "lucide-react";
import { apiRequest } from "../services/api";
import "../styles/quiz.css";

const TOPIC_META = {
  "DBMS": { icon: Database, desc: "Keys, relations and normalization." },
  "DSA": { icon: Layers, desc: "Stacks, queues, lists, trees and complexity." },
  "HTML & CSS": { icon: Globe, desc: "Markup, selectors and styling basics." },
  "JavaScript": { icon: Braces, desc: "Core language concepts and the DOM." },
};

const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const letter = index => String.fromCharCode(65 + index);
const cap = value => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "");

function ScoreRing({ percentage }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const tone = percentage >= 80 ? "good" : percentage >= 50 ? "mid" : "bad";
  return (
    <div className={`ring ring-${tone}`} role="img" aria-label={`Score ${Math.round(percentage)} percent`}>
      <svg viewBox="0 0 128 128" width="148" height="148">
        <circle cx="64" cy="64" r={radius} className="ring-bg" />
        <circle cx="64" cy="64" r={radius} className="ring-fg" strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(percentage, 100) / 100)} transform="rotate(-90 64 64)" />
      </svg>
      <div className="ring-text"><b>{Math.round(percentage)}%</b><span>Score</span></div>
    </div>
  );
}

function Modal({ title, body, confirmLabel, onConfirm, onCancel, danger }) {
  useEffect(() => {
    const onKey = event => { if (event.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="modal-back" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={event => event.stopPropagation()}>
        <h3 id="modal-title">{title}</h3>
        <p>{body}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Keep working</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function Assessment() {
  const [topics, setTopics] = useState([]);
  const [topicStats, setTopicStats] = useState({});
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [starting, setStarting] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [filter, setFilter] = useState("all");

  const inQuiz = questions.length > 0 && !result;

  useEffect(() => { document.title = "Assessment - EduXai"; }, []);

  const loadTopics = useCallback(() => {
    setLoadingTopics(true);
    setError("");
    apiRequest("/assessment/topics")
      .then(data => setTopics(data.topics || []))
      .catch(err => setError(err.message))
      .finally(() => setLoadingTopics(false));
    apiRequest("/performance/me")
      .then(data => setTopicStats(Object.fromEntries((data.topicStats || []).map(item => [item.topic, item]))))
      .catch(() => {});
  }, []);

  useEffect(() => { loadTopics(); }, [loadTopics]);

  // Timer
  useEffect(() => {
    if (!inQuiz) return undefined;
    const id = setInterval(() => setElapsed(value => value + 1), 1000);
    return () => clearInterval(id);
  }, [inQuiz]);

  async function startQuiz(selected) {
    setStarting(selected); setError("");
    try {
      const data = await apiRequest(`/assessment/questions/${encodeURIComponent(selected)}`);
      if (!data.questions?.length) { setError("No questions found for this topic. Run npm run seed in the backend first."); return; }
      setTopic(selected); setQuestions(data.questions);
      setAnswers({}); setFlagged({}); setCurrent(0); setResult(null); setElapsed(0); setFilter("all");
    } catch (err) { setError(err.message); }
    finally { setStarting(""); }
  }

  function backToTopics() {
    setQuestions([]); setResult(null); setAnswers({}); setFlagged({}); setModal(null); setError("");
    loadTopics();
  }

  async function submitQuiz() {
    setModal(null); setSubmitting(true); setError("");
    try {
      const payload = questions.map(question => ({ questionId: question._id, selectedOption: answers[question._id] ?? -1 }));
      const data = await apiRequest("/assessment/submit", { method: "POST", body: JSON.stringify({ topic, answers: payload }) });
      setFinalTime(elapsed);
      setResult(data);
      window.scrollTo?.({ top: 0 });
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  const answeredCount = Object.keys(answers).length;
  const unanswered = questions.length - answeredCount;
  const question = questions[current];

  function choose(index) {
    if (!question) return;
    setAnswers(old => ({ ...old, [question._id]: index }));
  }

  function requestSubmit() {
    if (unanswered > 0) setModal("submit"); else submitQuiz();
  }

  // Keyboard shortcuts while taking a quiz
  useEffect(() => {
    if (!inQuiz || modal) return undefined;
    const onKey = event => {
      if (event.target.closest?.("input, textarea, select") || event.metaKey || event.ctrlKey || event.altKey) return;
      const q = questions[current];
      if (!q) return;
      const key = event.key.toLowerCase();
      const idx = /^[1-9]$/.test(key) ? Number(key) - 1 : "abcdef".indexOf(key);
      if (key.length === 1 && idx >= 0 && idx < q.options.length) { setAnswers(old => ({ ...old, [q._id]: idx })); return; }
      if (event.key === "ArrowRight") setCurrent(value => Math.min(value + 1, questions.length - 1));
      if (event.key === "ArrowLeft") setCurrent(value => Math.max(value - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inQuiz, modal, questions, current]);

  const reviewItems = useMemo(() => {
    if (!result) return [];
    const list = result.results.map((item, index) => ({ ...item, number: index + 1 }));
    return filter === "wrong" ? list.filter(item => !item.isCorrect) : list;
  }, [result, filter]);

  /* ---------- Topic selection ---------- */
  if (!inQuiz && !result) {
    return (
      <section className="page">
        <header className="page-head">
          <p className="eyebrow">Assessment</p>
          <h1>Check what you know</h1>
          <p>Choose a topic to start a short quiz. You will see your score and an explanation for every question.</p>
        </header>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} /><span>{error}</span>
          </div>
        )}

        {loadingTopics ? (
          <div className="topic-grid">{[0, 1, 2, 3].map(n => <div className="topic-card skeleton" key={n} />)}</div>
        ) : topics.length === 0 && !error ? (
          <div className="empty-card">
            <BookOpen size={22} />
            <h3>No quiz topics yet</h3>
            <p>Connect the database and run <code>npm run seed</code> in the backend folder to add the sample questions.</p>
          </div>
        ) : (
          <div className="topic-grid">
            {topics.map(name => {
              const meta = TOPIC_META[name] || { icon: BookOpen, desc: "Practice questions for this topic." };
              const Icon = meta.icon;
              const stat = topicStats[name];
              return (
                <article className="topic-card" key={name}>
                  <div className="topic-top">
                    <span className="topic-icon"><Icon size={19} /></span>
                    {stat && <span className={`badge ${stat.averageScore >= 80 ? "good" : stat.averageScore >= 60 ? "mid" : "bad"}`}>Avg {stat.averageScore}%</span>}
                  </div>
                  <h3>{name}</h3>
                  <p>{meta.desc}</p>
                  <div className="topic-foot">
                    <span className="muted">{stat ? `${stat.attempts} attempt${stat.attempts === 1 ? "" : "s"}` : "Not attempted"}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => startQuiz(name)} disabled={Boolean(starting)}>
                      {starting === name ? <span className="spinner" /> : <>Start <ArrowRight size={14} /></>}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  /* ---------- Result ---------- */
  if (result) {
    const incorrect = result.results.filter(item => !item.isCorrect && item.selectedOption !== -1).length;
    const skipped = result.results.filter(item => item.selectedOption === -1).length;
    const tone = result.percentage >= 80 ? "good" : result.percentage >= 50 ? "mid" : "bad";
    return (
      <section className="page">
        <header className="page-head">
          <p className="eyebrow">{topic} assessment</p>
          <h1>Your results</h1>
        </header>

        <div className="result-card">
          <ScoreRing percentage={result.percentage} />
          <div className="result-info">
            <h2>{result.score} of {result.totalQuestions} correct</h2>
            <p className={`result-verdict ${tone}`}>{result.feedback}</p>
            <div className="result-stats">
              <div><b className="t-good">{result.score}</b><span>Correct</span></div>
              <div><b className="t-bad">{incorrect}</b><span>Incorrect</span></div>
              <div><b>{skipped}</b><span>Skipped</span></div>
              <div><b>{formatTime(finalTime)}</b><span>Time</span></div>
            </div>
            <div className="result-actions">
              <button className="btn btn-primary" onClick={() => startQuiz(topic)} disabled={Boolean(starting)}><RotateCcw size={15} /> Retake quiz</button>
              <button className="btn btn-secondary" onClick={backToTopics}>Choose another topic</button>
            </div>
          </div>
        </div>

        <div className="review-head">
          <h2>Review answers</h2>
          <div className="segmented">
            <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All ({result.results.length})</button>
            <button aria-pressed={filter === "wrong"} onClick={() => setFilter("wrong")}>Incorrect ({result.results.length - result.score})</button>
          </div>
        </div>

        {reviewItems.length === 0 ? (
          <div className="empty-card"><Check size={22} /><h3>Nothing to review</h3><p>You answered every question correctly.</p></div>
        ) : (
          <div className="review-list">
            {reviewItems.map(item => (
              <article className="review-card" key={item.questionId}>
                <div className="review-top">
                  <span className="q-num">Question {item.number}</span>
                  <span className={`status ${item.isCorrect ? "ok" : item.selectedOption === -1 ? "skip" : "no"}`}>
                    {item.isCorrect ? <><Check size={13} /> Correct</> : item.selectedOption === -1 ? "Skipped" : <><X size={13} /> Incorrect</>}
                  </span>
                </div>
                <h3>{item.question}</h3>
                <ul className="answer-list">
                  {item.options.map((option, index) => {
                    const isCorrect = index === item.correctAnswer;
                    const isPicked = index === item.selectedOption;
                    const state = isCorrect ? "correct" : isPicked ? "wrong" : "";
                    return (
                      <li key={index} className={`answer ${state}`}>
                        <b>{letter(index)}</b>
                        <span>{option}</span>
                        {isCorrect && <em>{isPicked ? "Your answer" : "Correct answer"}</em>}
                        {isPicked && !isCorrect && <em>Your answer</em>}
                      </li>
                    );
                  })}
                </ul>
                {item.explanation && <div className="explain"><strong>Explanation</strong><p>{item.explanation}</p></div>}
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  /* ---------- Taking the quiz ---------- */
  const selected = answers[question._id];
  const progress = (answeredCount / questions.length) * 100;
  return (
    <section className="page">
      <header className="quiz-head">
        <div>
          <p className="eyebrow">{topic} assessment</p>
          <h1>Question {current + 1} <span>of {questions.length}</span></h1>
        </div>
        <button className="btn btn-ghost" onClick={() => setModal("exit")}>Exit quiz</button>
      </header>

      <div className="quiz-progress" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answeredCount} aria-label="Questions answered">
        <i style={{ width: `${progress}%` }} />
      </div>

      {error && <div className="alert alert-error" role="alert"><AlertCircle size={16} /><span>{error}</span></div>}

      <div className="quiz-layout">
        <div className="q-card">
          <div className="q-meta">
            <span className="q-num">Question {current + 1}</span>
            <div className="q-meta-right">
              {question.difficulty && <span className="badge neutral">{cap(question.difficulty)}</span>}
              <button className={`flag ${flagged[question._id] ? "on" : ""}`} aria-pressed={Boolean(flagged[question._id])}
                onClick={() => setFlagged(old => ({ ...old, [question._id]: !old[question._id] }))}>
                <Flag size={14} /> {flagged[question._id] ? "Marked" : "Mark for review"}
              </button>
            </div>
          </div>
          <h2 className="q-text">{question.question}</h2>
          <div className="options" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, index) => (
              <button type="button" key={index} role="radio" aria-checked={selected === index}
                className={`option ${selected === index ? "selected" : ""}`} onClick={() => choose(index)}>
                <b>{letter(index)}</b>
                <span>{option}</span>
                <i aria-hidden="true">{selected === index && <Check size={13} />}</i>
              </button>
            ))}
          </div>
          <div className="q-nav">
            <button className="btn btn-secondary" onClick={() => setCurrent(v => Math.max(0, v - 1))} disabled={current === 0}><ArrowLeft size={15} /> Previous</button>
            {current < questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setCurrent(v => v + 1)}>Next <ArrowRight size={15} /></button>
            ) : (
              <button className="btn btn-primary" onClick={requestSubmit} disabled={submitting}>
                {submitting ? <><span className="spinner" /> Submitting</> : "Submit quiz"}
              </button>
            )}
          </div>
          <p className="kbd-hint">Tip: press A to D to answer, and the arrow keys to move between questions.</p>
        </div>

        <aside className="q-side">
          <div className="side-card">
            <div className="timer"><Clock size={16} /><b>{formatTime(elapsed)}</b></div>
            <p className="side-label">Questions</p>
            <div className="palette">
              {questions.map((item, index) => (
                <button key={item._id} onClick={() => setCurrent(index)} aria-label={`Go to question ${index + 1}`} aria-current={index === current}
                  className={`${index === current ? "current" : ""} ${answers[item._id] !== undefined ? "answered" : ""} ${flagged[item._id] ? "flagged" : ""}`}>
                  {index + 1}
                </button>
              ))}
            </div>
            <ul className="legend">
              <li><i className="answered" /> Answered</li>
              <li><i className="current" /> Current</li>
              <li><i className="flagged" /> Marked</li>
            </ul>
            <div className="side-count"><b>{answeredCount}</b> of {questions.length} answered</div>
            <button className="btn btn-dark btn-block" onClick={requestSubmit} disabled={submitting}>Submit quiz</button>
          </div>
        </aside>
      </div>

      {modal === "submit" && (
        <Modal title="Submit with unanswered questions?" confirmLabel="Submit quiz" onConfirm={submitQuiz} onCancel={() => setModal(null)}
          body={`You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. They will be marked as skipped.`} />
      )}
      {modal === "exit" && (
        <Modal title="Exit this quiz?" confirmLabel="Exit quiz" danger onConfirm={backToTopics} onCancel={() => setModal(null)}
          body="Your answers will be discarded and nothing will be saved." />
      )}
    </section>
  );
}
