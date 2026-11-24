import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, X, Menu, Plus, MessageSquare, ClipboardList, TrendingUp, Languages,
  Database, Layers, Globe, Braces, Copy,
} from "lucide-react";
import Logo from "../components/Logo";
import "../styles/landing.css";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#product", label: "Product" },
  { href: "#subjects", label: "Subjects" },
  { href: "#faq", label: "FAQ" },
];

function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Navbar({ signedIn }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="lp-wrap lp-nav-inner">
        <Logo />
        <nav className="lp-nav-links" aria-label="Primary">
          {NAV.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="lp-nav-cta">
          {signedIn ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Open dashboard <ArrowRight size={15} /></Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-dark btn-sm">Get started</Link>
            </>
          )}
        </div>
        <button className="lp-burger" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
      </div>
      {open && (
        <div className="lp-drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="lp-drawer-top">
            <Logo />
            <button className="lp-burger show" onClick={() => setOpen(false)} aria-label="Close menu"><X size={22} /></button>
          </div>
          <nav className="lp-drawer-links">
            {NAV.map(item => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
          </nav>
          <div className="lp-drawer-cta">
            {signedIn ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg btn-block">Open dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg btn-block">Get started</Link>
                <Link to="/login" className="btn btn-secondary btn-lg btn-block">Log in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function HeroProduct() {
  return (
    <div className="hero-product" aria-hidden="true">
      <div className="win">
        <div className="win-bar">
          <span /><span /><span />
          <div className="win-url">eduxai.app / tutor</div>
        </div>
        <div className="win-body">
          <aside className="win-side">
            <div className="win-side-btn"><Plus size={13} /> New chat</div>
            <p>Today</p>
            <div className="win-chat active">DBMS normalization</div>
            <div className="win-chat">Binary search steps</div>
            <p>Earlier</p>
            <div className="win-chat">Flexbox vs grid</div>
            <div className="win-chat">Closures in JavaScript</div>
          </aside>
          <div className="win-main">
            <div className="msg-user">Explain 2NF with a small example.</div>
            <div className="msg-ai">
              <div className="msg-ai-head"><span className="dot" /> EduXai</div>
              <p><strong>Second Normal Form</strong> removes partial dependencies. A table is in 2NF when it is in 1NF and every non-key column depends on the whole primary key.</p>
              <div className="code">
                <div className="code-head"><span>sql</span><span className="code-copy"><Copy size={11} /> Copy</span></div>
                <pre>{`-- Before: course_name depends only on course_id
enrolments(student_id, course_id, course_name, grade)

-- After
enrolments(student_id, course_id, grade)
courses(course_id, course_name)`}</pre>
              </div>
            </div>
            <div className="composer-mini"><span>Ask a follow-up</span><span className="send-mini"><ArrowRight size={13} /></span></div>
          </div>
        </div>
      </div>

      <div className="float-quiz">
        <div className="fq-top"><span>DBMS</span><span>Question 2 of 5</span></div>
        <div className="fq-bar"><i style={{ width: "40%" }} /></div>
        <p className="fq-q">Which key uniquely identifies each row in a table?</p>
        <div className="fq-opt"><b>A</b>Foreign key</div>
        <div className="fq-opt sel"><b>B</b>Primary key <Check size={14} /></div>
        <div className="fq-opt"><b>C</b>Duplicate key</div>
      </div>
    </div>
  );
}

function Hero({ signedIn }) {
  return (
    <section className="hero">
      <div className="lp-wrap hero-grid">
        <div className="hero-copy">
          <p className="hero-tag"><span>New</span> Tutor replies now stream in live</p>
          <h1>A tutor that learns <em>how you learn.</em></h1>
          <p className="hero-sub">EduXai explains any concept in the style you choose, in English or Hindi, then tests you with focused quizzes and shows exactly what to revise next.</p>
          <div className="hero-cta">
            <Link to={signedIn ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">{signedIn ? "Open dashboard" : "Start learning free"} <ArrowRight size={17} /></Link>
            <a href="#product" className="btn btn-secondary btn-lg">See the product</a>
          </div>
          <ul className="hero-points">
            <li><Check size={15} /> English and Hindi</li>
            <li><Check size={15} /> Three explanation styles</li>
            <li><Check size={15} /> Scored quizzes with explanations</li>
          </ul>
        </div>
        <HeroProduct />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="lp-section" id="features">
      <div className="lp-wrap">
        <div className="sec-head" data-reveal>
          <p className="eyebrow">Features</p>
          <h2>Everything you need to actually understand a topic</h2>
          <p>Ask, practise, review. One workspace that keeps the loop short.</p>
        </div>
        <div className="bento">
          <article className="bento-card b-tutor" data-reveal>
            <div className="b-icon"><MessageSquare size={18} /></div>
            <h3>An AI tutor you can interrogate</h3>
            <p>Follow-up questions, worked examples and code, all in one conversation. Responses stream in as they are written, and every chat is saved so you can return to it.</p>
            <div className="b-visual chat-visual">
              <div className="cv-user">Why is binary search O(log n)?</div>
              <div className="cv-ai"><i /><i style={{ width: "86%" }} /><i style={{ width: "64%" }} /></div>
            </div>
          </article>
          <article className="bento-card b-quiz" data-reveal>
            <div className="b-icon"><ClipboardList size={18} /></div>
            <h3>Assessments that explain themselves</h3>
            <p>Topic-based questions are marked on the server. Every answer comes with the reasoning behind it.</p>
            <div className="b-visual opt-visual">
              <div className="ov ok"><b>B</b> Reduce redundancy <Check size={13} /></div>
              <div className="ov bad"><b>C</b> Delete tables <X size={13} /></div>
            </div>
          </article>
          <article className="bento-card b-progress" data-reveal>
            <div className="b-icon"><TrendingUp size={18} /></div>
            <h3>See where you stand</h3>
            <p>Scores roll up by topic so weak areas are obvious.</p>
            <div className="b-visual bars-visual">
              {[48, 62, 55, 78, 90].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
            </div>
          </article>
          <article className="bento-card b-lang" data-reveal>
            <div className="b-icon"><Languages size={18} /></div>
            <h3>Your language, your pace</h3>
            <p>Switch between English and Hindi for each question, and choose between a simple explanation, an exam answer or a detailed deep dive.</p>
            <div className="b-visual chips-visual">
              <span className="chip on">Simple</span><span className="chip">Exam answer</span><span className="chip">Detailed</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    { n: "01", t: "Ask anything", d: "Type a question from your syllabus. Pick the language and how deep you want the explanation to go." },
    { n: "02", t: "Check yourself", d: "Take a short assessment on the topic. Answers are marked instantly and each one comes with an explanation." },
    { n: "03", t: "Fix the gaps", d: "Your progress page highlights the topics that need practice, so the next session starts in the right place." },
  ];
  return (
    <section className="lp-section tinted" id="how">
      <div className="lp-wrap">
        <div className="sec-head" data-reveal>
          <p className="eyebrow">How it works</p>
          <h2>Learn, test, improve</h2>
        </div>
        <ol className="steps">
          {steps.map(s => (
            <li key={s.n} className="step" data-reveal>
              <span className="step-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Showcase() {
  const [tab, setTab] = useState("tutor");
  const tabs = [
    { id: "tutor", label: "AI Tutor" },
    { id: "quiz", label: "Assessment" },
    { id: "progress", label: "Progress" },
  ];
  return (
    <section className="lp-section dark" id="product">
      <div className="lp-wrap">
        <div className="sec-head light" data-reveal>
          <p className="eyebrow">Product</p>
          <h2>Built for focused study sessions</h2>
          <p>Clean surfaces, no clutter, nothing between you and the material.</p>
        </div>
        <div className="show-tabs" role="tablist" data-reveal>
          {tabs.map(t => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="show-stage" data-reveal>
          {tab === "tutor" && (
            <div className="sc sc-chat">
              <div className="sc-user">Give me an exam answer: what is a stack?</div>
              <div className="sc-ai">
                <h4>Stack</h4>
                <p><strong>Definition.</strong> A stack is a linear data structure that follows Last In, First Out (LIFO) order.</p>
                <ul>
                  <li>push() adds an element to the top</li>
                  <li>pop() removes the top element</li>
                  <li>peek() reads the top without removing it</li>
                </ul>
                <p><strong>Applications.</strong> Function call management, undo operations, expression evaluation.</p>
              </div>
            </div>
          )}
          {tab === "quiz" && (
            <div className="sc sc-quiz">
              <div className="scq-main">
                <div className="scq-top"><span>Question 3 of 5</span><span className="pill">Medium</span></div>
                <h4>Which traversal of a BST visits keys in sorted order?</h4>
                <div className="scq-opt"><b>A</b>Preorder</div>
                <div className="scq-opt"><b>B</b>Postorder</div>
                <div className="scq-opt sel"><b>C</b>Inorder</div>
                <div className="scq-opt"><b>D</b>Level order</div>
              </div>
              <div className="scq-side">
                <p>Questions</p>
                <div className="scq-grid">
                  {[1, 2, 3, 4, 5].map(n => <span key={n} className={n < 3 ? "done" : n === 3 ? "cur" : ""}>{n}</span>)}
                </div>
                <div className="scq-timer">04:12</div>
              </div>
            </div>
          )}
          {tab === "progress" && (
            <div className="sc sc-progress">
              <div className="scp-stats">
                <div><span>Average score</span><b>76%</b></div>
                <div><span>Quizzes</span><b>12</b></div>
                <div><span>Topics</span><b>4</b></div>
              </div>
              <div className="scp-rows">
                {[["JavaScript", 92, "good"], ["HTML & CSS", 84, "good"], ["DSA", 61, "mid"], ["DBMS", 48, "bad"]].map(([name, v, tone]) => (
                  <div className="scp-row" key={name}>
                    <span>{name}</span>
                    <div className="scp-track"><i className={tone} style={{ width: `${v}%` }} /></div>
                    <b>{v}%</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Subjects() {
  const subjects = [
    { icon: Database, name: "DBMS", d: "Normalization, keys, relations and the fundamentals of relational design." },
    { icon: Layers, name: "DSA", d: "Stacks, queues, linked lists, trees and complexity analysis." },
    { icon: Globe, name: "HTML & CSS", d: "Semantic markup, selectors, the box model, layout and styling." },
    { icon: Braces, name: "JavaScript", d: "Core language concepts, functions, scope, arrays and the DOM." },
  ];
  return (
    <section className="lp-section" id="subjects">
      <div className="lp-wrap">
        <div className="sec-head" data-reveal>
          <p className="eyebrow">Subjects</p>
          <h2>Start with the core of a CS course</h2>
          <p>Quiz sets are ready on day one. Ask the tutor about anything else.</p>
        </div>
        <div className="subjects">
          {subjects.map(({ icon: Icon, name, d }) => (
            <article className="subject" key={name} data-reveal>
              <div className="b-icon"><Icon size={18} /></div>
              <h3>{name}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  const items = [
    { q: "Is EduXai free to use?", a: "You can create an account and use the tutor and assessments without entering payment details." },
    { q: "Which languages does the tutor support?", a: "English and Hindi. You can change the language for every question, so you can switch mid-conversation." },
    { q: "Can the tutor make mistakes?", a: "Yes. Like any AI model it can be wrong or incomplete. Check important answers against your class notes or textbook, and use the quizzes to confirm your understanding." },
    { q: "How are quizzes marked?", a: "Answers are checked on the server against the stored correct option. You see your score, the right answer for every question and a short explanation." },
    { q: "Are my chats saved?", a: "Conversations are saved in your browser on the device you use, so they are there when you come back. Clearing site data removes them." },
  ];
  return (
    <section className="lp-section tinted" id="faq">
      <div className="lp-wrap faq-grid">
        <div className="sec-head left" data-reveal>
          <p className="eyebrow">FAQ</p>
          <h2>Questions, answered</h2>
          <p>Still unsure? Create an account and try the tutor with a real question.</p>
        </div>
        <div className="faq" data-reveal>
          {items.map((item, i) => (
            <div className={`faq-item ${open === i ? "open" : ""}`} key={item.q}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{item.q}</span><Plus size={18} />
              </button>
              <div className="faq-a"><div><p>{item.a}</p></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta({ signedIn }) {
  return (
    <section className="lp-section cta-sec">
      <div className="lp-wrap">
        <div className="cta" data-reveal>
          <h2>Your next study session starts here</h2>
          <p>Ask your first question in under a minute.</p>
          <Link to={signedIn ? "/dashboard" : "/register"} className="btn btn-lg cta-btn">{signedIn ? "Open dashboard" : "Create your account"} <ArrowRight size={17} /></Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap foot-grid">
        <div>
          <Logo />
          <p className="foot-note">An AI tutor and adaptive assessment platform for students.</p>
        </div>
        <div className="foot-cols">
          <div><h4>Product</h4><a href="#features">Features</a><a href="#product">Product</a><a href="#subjects">Subjects</a></div>
          <div><h4>Account</h4><Link to="/login">Log in</Link><Link to="/register">Sign up</Link></div>
          <div><h4>Help</h4><a href="#how">How it works</a><a href="#faq">FAQ</a></div>
        </div>
      </div>
      <div className="lp-wrap foot-bottom">
        <span>{new Date().getFullYear()} EduXai. All rights reserved.</span>
        <span>AI can make mistakes. Verify important answers.</span>
      </div>
    </footer>
  );
}

export default function Landing() {
  const signedIn = Boolean(localStorage.getItem("token"));
  const root = useRef(null);
  useReveal();
  useEffect(() => { document.title = "EduXai - Learn with an AI tutor that adapts to you"; }, []);
  return (
    <div className="landing" ref={root}>
      <Navbar signedIn={signedIn} />
      <main>
        <Hero signedIn={signedIn} />
        <Features />
        <How />
        <Showcase />
        <Subjects />
        <Faq />
        <Cta signedIn={signedIn} />
      </main>
      <Footer />
    </div>
  );
}
