import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageCircle, ClipboardList, TrendingUp, Settings, GraduationCap, LogOut, Menu, X } from "lucide-react";
import { clearSession } from "../services/api";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tutor", label: "AI Tutor", icon: MessageCircle },
    { to: "/assessment", label: "Assessment", icon: ClipboardList },
    { to: "/progress", label: "My Progress", icon: TrendingUp },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row"><GraduationCap size={25}/><h2>EduAdapt AI</h2><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X/></button></div>
        <p className="menu-label">LEARN</p>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/dashboard"} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><Icon size={19}/><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-bottom"><p>Learn at your own pace.</p><span>Personalized learning, every day.</span></div>
      </aside>
      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation"/>}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu/></button>
          <div><span className="eyebrow">YOUR LEARNING SPACE</span><h3>EduAdapt AI</h3></div>
          <div className="profile-container">
            <button className="profile" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen}>
              <span className="avatar">{(user.name || "S").charAt(0).toUpperCase()}</span>
              <span className="profile-name">{user.name || "Student"}</span>
            </button>
            {profileOpen && <div className="profile-menu"><strong>{user.name || "Student"}</strong><p>{user.email || ""}</p><button onClick={logout}><LogOut size={16}/> Logout</button></div>}
          </div>
        </header>
        <Outlet/>
      </main>
    </div>
  );
}
