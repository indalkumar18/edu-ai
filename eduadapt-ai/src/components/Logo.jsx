import { Link } from "react-router-dom";

export function LogoMark({ size = 30 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0f5c46" />
      <path d="M9 9l14 14" stroke="#f6f4ee" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M23 9L9 23" stroke="#9bd3b8" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ light = false, to = "/", size }) {
  return (
    <Link to={to} className={`logo ${light ? "light" : ""}`} aria-label="EduXai home">
      <LogoMark size={size} />
      <span>EduXai</span>
    </Link>
  );
}
