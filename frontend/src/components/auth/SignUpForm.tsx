import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/useAuth';
import { isValidFullName } from '../../auth/validation';
import { PasswordField } from './PasswordField';

export function SignUpForm() {
  const { signUp, error: authError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get('fullName')).trim();
    if (!isValidFullName(fullName)) {
      setError('Enter a name using letters and spaces only.');
      return;
    }
    const [firstName, ...lastNameParts] = fullName.split(/\s+/);
    setSubmitting(true);
    setError(null);
    try {
      await signUp({
        firstName,
        lastName: lastNameParts.join(' ') || undefined,
        phone: String(form.get('phone')),
        email: String(form.get('email')),
        password: String(form.get('password')),
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form sign-up-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="signup-full-name">Full name</label>
        <input
          id="signup-full-name"
          name="fullName"
          autoComplete="name"
          placeholder="Enter your full name"
          pattern="(?:\p{L}\p{M}*)+(?:\s+(?:\p{L}\p{M}*)+)*"
          title="Use letters and spaces only."
          onInvalid={(event) => event.currentTarget.setCustomValidity('Use letters and spaces only.')}
          onInput={(event) => event.currentTarget.setCustomValidity('')}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="Enter your email" required />
      </div>
      <div className="field">
        <label htmlFor="signup-phone">Phone number</label>
        <input id="signup-phone" name="phone" type="tel" autoComplete="tel" maxLength={10} required />
      </div>
      <PasswordField id="signup-password" name="password" label="Password" autoComplete="new-password" minLength={6} />
      {(error ?? authError) && <p className="form-error" role="alert">{error ?? authError}</p>}
      <button className="submit-button" type="submit" disabled={submitting}>
        {submitting ? <><span className="spinner" aria-hidden="true" /> Creating account…</> : 'Sign up'}
      </button>
      <div className="auth-divider" aria-hidden="true"><span />OR<span /></div>
    </form>
  );
}
