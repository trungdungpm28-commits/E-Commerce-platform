import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/useAuth';
import { PasswordField } from './PasswordField';

export function SignInForm() {
  const { signIn, error: authError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await signIn(String(form.get('email')), String(form.get('password')));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form sign-in-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="signin-email">Email</label>
        <input id="signin-email" name="email" type="email" autoComplete="email" placeholder="Enter your email" required />
      </div>
      <div className="password-field-wrap">
        <PasswordField id="signin-password" name="password" label="Password" autoComplete="current-password" />
        <span className="forgot-password" title="Password reset is not available from the backend">Forgot password?</span>
      </div>
      {(error ?? authError) && <p className="form-error" role="alert">{error ?? authError}</p>}
      <button className="submit-button" type="submit" disabled={submitting}>
        {submitting ? <><span className="spinner" aria-hidden="true" /> Signing in…</> : 'Sign in'}
      </button>
      <div className="auth-divider" aria-hidden="true"><span />OR<span /></div>
    </form>
  );
}
