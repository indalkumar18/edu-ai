import { useEffect, useState } from "react";
import { Check } from "lucide-react";

function readUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

export default function Settings() {
  const stored = readUser();
  const [language, setLanguage] = useState(stored.preferredLanguage === "Hindi" ? "Hindi" : "English");
  const [saved, setSaved] = useState(false);

  useEffect(() => { document.title = "Settings - EduXai"; }, []);

  function save() {
    localStorage.setItem("user", JSON.stringify({ ...readUser(), preferredLanguage: language }));
    setSaved(true);
  }

  return (
    <section className="page narrow">
      <header className="page-head">
        <p className="eyebrow">Settings</p>
        <h1>Preferences</h1>
        <p>Personalise how EduXai works for you.</p>
      </header>

      <div className="card">
        <div className="card-head"><h2>Account</h2></div>
        <dl className="kv">
          <div><dt>Name</dt><dd>{stored.name || "Student"}</dd></div>
          <div><dt>Email</dt><dd>{stored.email || "Not available"}</dd></div>
        </dl>
      </div>

      <div className="card">
        <div className="card-head"><h2>Tutor language</h2></div>
        <p className="muted pad-b">Used as the default language when you open the AI Tutor. You can still change it inside any chat.</p>
        <div className="segmented" role="group" aria-label="Preferred language">
          {["English", "Hindi"].map(lang => (
            <button key={lang} aria-pressed={language === lang} onClick={() => { setLanguage(lang); setSaved(false); }}>{lang}</button>
          ))}
        </div>
        <div className="save-row">
          <button className="btn btn-primary" onClick={save}>Save preference</button>
          {saved && <span className="saved"><Check size={15} /> Saved on this device</span>}
        </div>
      </div>
    </section>
  );
}
