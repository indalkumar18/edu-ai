import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, ClipboardList, TrendingUp, Settings, LogOut, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { clearSession } from "../services/api";
import "../styles/app.css";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tutor", label: "AI Tutor", icon: MessageSquare },
  { to: "/assessment", label: "Assessment", icon: ClipboardList },
  { to: "/progress", label: "Progress", icon: TrendingUp },
];

function readUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = readUser();
  const current = [...LINKS, { to: "/settings", label: "Settings" }].find(item => location.pathname.startsWith(item.to));

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  const navClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <div className="app-shell">
      {menuOpen && <button className="shell-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <Logo to="/dashboard" />
          <button className="icon-btn mobile-only" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <p className="nav-label">Learn</p>
        <nav className="nav" aria-label="Main">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navClass} onClick={() => setMenuOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>
          ))}
        </nav>
        <p className="nav-label">Account</p>
        <nav className="nav" aria-label="Account">
          <NavLink to="/settings" className={navClass} onClick={() => setMenuOpen(false)}><Settings size={18} /><span>Settings</span></NavLink>
        </nav>
        <div className="sidebar-user">
          <span className="avatar">{(user.name || "S").charAt(0).toUpperCase()}</span>
          <div className="user-meta"><strong>{user.name || "Student"}</strong><span>{user.email || ""}</span></div>
          <button className="icon-btn" onClick={logout} aria-label="Log out" title="Log out"><LogOut size={17} /></button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="mobile-bar">
          <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <strong>{current?.label || "EduXai"}</strong>
          <span className="avatar sm">{(user.name || "S").charAt(0).toUpperCase()}</span>
        </header>
        <div className="shell-scroll"><Outlet /></div>
      </div>
    </div>
  );
}
