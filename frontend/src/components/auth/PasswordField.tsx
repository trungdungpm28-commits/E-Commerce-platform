import { useState } from 'react';

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  minLength?: number;
}

export function PasswordField({ id, name, label, autoComplete, minLength }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          minLength={minLength}
        />
        <button
          className="visibility-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {visible
              ? <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.6" /></>
              : <><path d="M3 3l18 18M10.6 6.2c.5-.1.9-.2 1.4-.2 6.1 0 9.5 6 9.5 6a15.2 15.2 0 0 1-3.1 3.5M6.2 6.8C3.8 8.3 2.5 12 2.5 12s3.4 6 9.5 6c.9 0 1.7-.2 2.5-.4" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>}
          </svg>
        </button>
      </div>
    </div>
  );
}
