import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({ id, label, value, onChange, onBlur, error, autoComplete, placeholder, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id} name={id} className="input" type={show ? "text" : "password"}
          value={value} onChange={onChange} onBlur={onBlur}
          autoComplete={autoComplete} placeholder={placeholder}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} required
        />
        <button type="button" className="input-action" onClick={() => setShow(v => !v)} aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span className="field-error" id={`${id}-err`}>{error}</span>}
      {children}
    </div>
  );
}
