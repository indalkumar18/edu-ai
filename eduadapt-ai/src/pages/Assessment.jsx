import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { CheckCircle2, RotateCcw } from "lucide-react";

export default function Assessment() {
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/assessment/topics").then(data => { setTopics(data.topics || []); if (data.topics?.length) setTopic(data.topics[0]); })
      .catch(err => setError(err.message)).finally(() => setLoading(false));
  }, []);

  async function startQuiz(selectedTopic = topic) {
    if (!selectedTopic) return;
    setLoading(true); setError(""); setResult(null); setAnswers({}); setCurrent(0);
    try {
      const data = await apiRequest(`/assessment/questions/${encodeURIComponent(selectedTopic)}`);
      setQuestions(data.questions || []);
      if (!data.questions?.length) setError("No questions found. Run npm run seed in backend first.");
    } catch (err) { setQuestions([]); setError(err.message); }
    finally { setLoading(false); }
  }

  async function submitQuiz() {
    setSubmitting(true); setError("");
    try {
      const payload = questions.map(question => ({ questionId: question._id, selectedOption: answers[question._id] ?? -1 }));
      const data = await apiRequest("/assessment/submit", { method: "POST", body: JSON.stringify({ topic, answers: payload }) });
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  return <section className="page-content">
    <div className="page-heading"><div><p className="eyebrow">CHECK YOUR KNOWLEDGE</p><h1>Adaptive Assessment</h1><p>Choose a topic and answer the questions.</p></div></div>
    <div className="assessment-panel">
      <div className="topic-picker"><label htmlFor="topic">Choose topic</label><select id="topic" value={topic} onChange={e => { setTopic(e.target.value); setQuestions([]); setResult(null); }} disabled={!topics.length}>{topics.map(item => <option key={item} value={item}>{item}</option>)}</select><button className="primary-btn" onClick={() => startQuiz()} disabled={!topic || loading}>Load quiz</button></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {!topics.length && !error && !loading && <p>No quiz topics are available yet. Check the database and run the seed command.</p>}
      {loading && <p>Loading...</p>}
      {questions.length > 0 && !result && !loading && <>
        <div className="quiz-progress"><span>Question {current + 1} of {questions.length}</span><span>{Object.keys(answers).length} answered</span></div>
        <div className="progress-track"><div style={{ width: `${((current + 1) / questions.length) * 100}%` }}/></div>
        <div className="question-card"><p className="eyebrow">{topic.toUpperCase()}</p><h2>{questions[current].question}</h2><div className="option-list">{questions[current].options.map((option, index) => <button type="button" key={index} className={`option ${answers[questions[current]._id] === index ? "selected" : ""}`} onClick={() => setAnswers(old => ({ ...old, [questions[current]._id]: index }))}><span className="option-letter">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div></div>
        <div className="quiz-actions"><button className="secondary-btn" onClick={() => setCurrent(value => Math.max(0, value - 1))} disabled={current === 0}>Previous</button>{current < questions.length - 1 ? <button className="primary-btn" onClick={() => setCurrent(value => value + 1)}>Next question</button> : <button className="primary-btn" onClick={submitQuiz} disabled={submitting}>{submitting ? "Submitting..." : "Submit quiz"}</button>}</div>
      </>}
      {result && <div className="result-panel"><div className="result-icon"><CheckCircle2 size={34}/></div><p className="eyebrow">QUIZ COMPLETED</p><h2>{result.score} / {result.totalQuestions} correct</h2><div className="result-score">{result.percentage}%</div><p>{result.feedback}</p><div className="review-list">{result.results.map((item, index) => <div className="review-item" key={item.questionId}><strong>{index + 1}. {item.question}</strong><p className={item.isCorrect ? "correct-text" : "incorrect-text"}>{item.isCorrect ? "Correct" : `Correct answer: ${item.options[item.correctAnswer]}`}</p><small>{item.explanation}</small></div>)}</div><button className="primary-btn" onClick={() => startQuiz(topic)}><RotateCcw size={16}/> Try again</button></div>}
    </div>
  </section>;
}
