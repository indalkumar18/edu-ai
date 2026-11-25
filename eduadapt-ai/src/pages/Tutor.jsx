import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Check, Copy, PanelLeft, Plus, RotateCcw, Square, Trash2, X, MessageSquare } from "lucide-react";
import { LogoMark } from "../components/Logo";
import Markdown from "../lib/markdown";
import { groupChats } from "../lib/chats";
import { apiRequest, streamRequest } from "../services/api";
import "../styles/chat.css";

const SUGGESTIONS = [
  { title: "Explain normalization", sub: "DBMS, with a worked example", prompt: "Explain DBMS normalization up to 3NF with a small worked example." },
  { title: "Walk through binary search", sub: "Step by step, with code", prompt: "Walk me through binary search step by step and show the code in JavaScript." },
  { title: "Flexbox or Grid?", sub: "When to use which in CSS", prompt: "When should I use CSS Flexbox and when should I use CSS Grid? Give examples." },
  { title: "What is a closure?", sub: "JavaScript fundamentals", prompt: "What is a closure in JavaScript? Explain with a simple example." },
];

const STYLES = [
  { value: "beginner", label: "Simple" },
  { value: "exam", label: "Exam answer" },
  { value: "advanced", label: "Detailed" },
];

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

function readUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

function loadChats(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* ignore */ }
  }
  return (
    <button type="button" className="msg-action" onClick={copy} aria-label="Copy response">
      {done ? <Check size={15} /> : <Copy size={15} />}<span>{done ? "Copied" : "Copy"}</span>
    </button>
  );
}

export default function Tutor() {
  const user = useMemo(readUser, []);
  const storageKey = `eduxai.chats.${user.id || user._id || user.email || "guest"}`;
  const [chats, setChats] = useState(() => loadChats(storageKey));
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState(user.preferredLanguage === "Hindi" ? "Hindi" : "English");
  const [style, setStyle] = useState("beginner");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [showJump, setShowJump] = useState(false);

  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const stickRef = useRef(true);
  const textareaRef = useRef(null);

  const active = chats.find(chat => chat.id === activeId) || null;
  const messages = active?.messages || [];

  useEffect(() => { document.title = "AI Tutor - EduXai"; }, []);

  // Persist chats once a response has finished.
  useEffect(() => {
    if (streaming) return;
    try { localStorage.setItem(storageKey, JSON.stringify(chats.slice(0, 60))); } catch { /* storage full or blocked */ }
  }, [chats, streaming, storageKey]);

  // Stop any request when leaving the page.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Keep the view pinned to the newest text unless the user scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickRef.current = nearBottom;
    setShowJump(!nearBottom);
  }

  function jumpToLatest() {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  // Auto-grow the composer.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const patchChat = useCallback((id, updater) => {
    setChats(list => list.map(chat => (chat.id === id ? updater(chat) : chat)));
  }, []);

  const runAnswer = useCallback(async (chatId, question, history) => {
    setError("");
    setStreaming(true);
    stickRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    const payload = { question, language, style, history };
    let received = "";

    const append = token => {
      received += token;
      patchChat(chatId, chat => {
        const next = [...chat.messages];
        next[next.length - 1] = { ...next[next.length - 1], text: received };
        return { ...chat, messages: next };
      });
    };

    try {
      try {
        await streamRequest("/ai/teach/stream", payload, { signal: controller.signal, onToken: append });
      } catch (err) {
        // If streaming is not available on the server, fall back to a normal request.
        if (err?.name === "AbortError" || received) throw err;
        if (!/Cannot reach the backend|API route not found|Request failed \(404\)/.test(err.message)) throw err;
        const data = await apiRequest("/ai/teach", { method: "POST", body: JSON.stringify(payload), signal: controller.signal });
        append(data.answer);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError(err.message || "Something went wrong. Please try again.");
        if (!received) {
          patchChat(chatId, chat => ({ ...chat, messages: chat.messages.slice(0, -1) }));
        }
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      patchChat(chatId, chat => {
        const last = chat.messages[chat.messages.length - 1];
        const trimmed = last && last.role === "assistant" && !last.text ? chat.messages.slice(0, -1) : chat.messages;
        return { ...chat, messages: trimmed, updatedAt: Date.now() };
      });
    }
  }, [language, style, patchChat]);

  function send(text) {
    const question = (text ?? input).trim();
    if (!question || streaming) return;
    const history = messages.slice(-8).map(m => ({ role: m.role, text: m.text }));
    const userMessage = { id: uid(), role: "user", text: question };
    const assistantMessage = { id: uid(), role: "assistant", text: "" };

    let chatId = activeId;
    if (!chatId || !active) {
      chatId = uid();
      const title = question.length > 48 ? `${question.slice(0, 48).trim()}...` : question;
      setChats(list => [{ id: chatId, title, messages: [userMessage, assistantMessage], updatedAt: Date.now() }, ...list]);
      setActiveId(chatId);
    } else {
      patchChat(chatId, chat => ({ ...chat, messages: [...chat.messages, userMessage, assistantMessage], updatedAt: Date.now() }));
    }
    setInput("");
    runAnswer(chatId, question, history);
  }

  function regenerate() {
    if (streaming || !active) return;
    const list = active.messages;
    const lastUserIndex = [...list].map(m => m.role).lastIndexOf("user");
    if (lastUserIndex === -1) return;
    const question = list[lastUserIndex].text;
    const history = list.slice(0, lastUserIndex).slice(-8).map(m => ({ role: m.role, text: m.text }));
    patchChat(active.id, chat => ({
      ...chat,
      messages: [...chat.messages.slice(0, lastUserIndex + 1), { id: uid(), role: "assistant", text: "" }],
    }));
    runAnswer(active.id, question, history);
  }

  function stop() { abortRef.current?.abort(); }

  function newChat() {
    if (streaming) stop();
    setActiveId(null); setError(""); setInput(""); setDrawer(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function openChat(id) {
    if (streaming) stop();
    setActiveId(id); setError(""); setDrawer(false);
    stickRef.current = true;
  }

  function removeChat(id, event) {
    event.stopPropagation();
    if (id === activeId) { if (streaming) stop(); setActiveId(null); }
    setChats(list => list.filter(chat => chat.id !== id));
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  const lastAssistantIndex = messages.length - 1;
  const grouped = groupChats(chats);

  return (
    <div className="chat-app">
      {drawer && <button className="chat-backdrop" aria-label="Close history" onClick={() => setDrawer(false)} />}
      <aside className={`chat-side ${drawer ? "open" : ""}`} aria-label="Chat history">
        <div className="chat-side-top">
          <button className="btn btn-secondary btn-block new-chat" onClick={newChat}><Plus size={16} /> New chat</button>
          <button className="chat-side-close" onClick={() => setDrawer(false)} aria-label="Close history"><X size={18} /></button>
        </div>
        <div className="chat-list">
          {grouped.length === 0 && <p className="chat-list-empty">Your conversations will appear here.</p>}
          {grouped.map(([label, list]) => (
            <div key={label} className="chat-group">
              <p>{label}</p>
              {list.map(chat => (
                <div key={chat.id} className={`chat-item ${chat.id === activeId ? "active" : ""}`}>
                  <button className="chat-item-main" onClick={() => openChat(chat.id)} title={chat.title}>{chat.title}</button>
                  <button className="chat-item-del" onClick={event => removeChat(chat.id, event)} aria-label={`Delete chat ${chat.title}`}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-head">
          <button className="chat-toggle" onClick={() => setDrawer(true)} aria-label="Open chat history"><PanelLeft size={19} /></button>
          <h1 className="chat-title">{active?.title || "New chat"}</h1>
          <div className="chat-opts">
            <label className="opt">
              <span className="sr-only">Language</span>
              <select className="select select-sm" value={language} onChange={e => setLanguage(e.target.value)} aria-label="Language">
                <option>English</option><option>Hindi</option>
              </select>
            </label>
            <label className="opt">
              <span className="sr-only">Explanation style</span>
              <select className="select select-sm" value={style} onChange={e => setStyle(e.target.value)} aria-label="Explanation style">
                {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>
        </header>

        <div className="chat-scroll" ref={scrollRef} onScroll={onScroll}>
          {messages.length === 0 ? (
            <div className="chat-empty">
              <LogoMark size={44} />
              <h2>What are you studying today?</h2>
              <p>Ask a question, paste a problem, or start with one of these.</p>
              <div className="suggest-grid">
                {SUGGESTIONS.map(s => (
                  <button key={s.title} className="suggest" onClick={() => send(s.prompt)}>
                    <strong>{s.title}</strong>
                    <span>{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="thread" aria-live="polite">
              {messages.map((message, index) => (
                message.role === "user" ? (
                  <div className="turn user" key={message.id || index}>
                    <div className="bubble">{message.text}</div>
                  </div>
                ) : (
                  <div className="turn ai" key={message.id || index}>
                    <div className="ai-avatar"><LogoMark size={26} /></div>
                    <div className="ai-body">
                      {message.text ? (
                        <>
                          <Markdown text={message.text} />
                          {streaming && index === lastAssistantIndex && <span className="caret" aria-hidden="true" />}
                        </>
                      ) : (
                        <div className="typing" aria-label="EduXai is thinking"><i /><i /><i /></div>
                      )}
                      {message.text && !(streaming && index === lastAssistantIndex) && (
                        <div className="msg-actions">
                          <CopyButton text={message.text} />
                          {index === lastAssistantIndex && (
                            <button type="button" className="msg-action" onClick={regenerate}><RotateCcw size={15} /><span>Regenerate</span></button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {showJump && messages.length > 0 && (
          <button className="jump" onClick={jumpToLatest} aria-label="Scroll to latest message"><ArrowDown size={16} /></button>
        )}

        <div className="composer-zone">
          {error && (
            <div className="alert alert-error chat-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss"><X size={15} /></button>
            </div>
          )}
          <form className="composer" onSubmit={e => { e.preventDefault(); send(); }}>
            <textarea
              ref={textareaRef} value={input} rows={1} maxLength={3000}
              onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown}
              placeholder="Ask EduXai anything about your syllabus"
              aria-label="Message"
            />
            <div className="composer-bar">
              <span className="composer-hint">{input.length > 2400 ? `${input.length}/3000` : "Enter to send, Shift+Enter for a new line"}</span>
              {streaming ? (
                <button type="button" className="send stop" onClick={stop} aria-label="Stop generating"><Square size={13} fill="currentColor" /></button>
              ) : (
                <button type="submit" className="send" disabled={!input.trim()} aria-label="Send message"><ArrowUp size={18} /></button>
              )}
            </div>
          </form>
          <p className="chat-note"><MessageSquare size={12} /> EduXai can make mistakes. Check important answers with your notes or textbook.</p>
        </div>
      </section>
    </div>
  );
}
