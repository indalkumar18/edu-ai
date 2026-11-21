import { useState } from "react";
export default function Settings() {
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem("user") || "{}"); } catch { stored = {}; }
  const [language, setLanguage] = useState(stored.preferredLanguage || "English");
  const [saved, setSaved] = useState(false);
  function save() { localStorage.setItem("user", JSON.stringify({ ...stored, preferredLanguage: language })); setSaved(true); }
  return <section className="page-content"><div className="page-heading"><div><p className="eyebrow">PERSONALIZE YOUR EXPERIENCE</p><h1>Settings</h1><p>Choose your preferred tutor language.</p></div></div><div className="panel settings-panel"><label htmlFor="language">Preferred language</label><select id="language" value={language} onChange={e => { setLanguage(e.target.value); setSaved(false); }}><option>English</option><option>Hindi</option></select><button className="primary-btn" onClick={save}>Save preference</button>{saved && <p className="success-text">Preference saved on this device.</p>}<p className="muted">The AI Tutor also has its own language selector for each question.</p></div></section>;
}
