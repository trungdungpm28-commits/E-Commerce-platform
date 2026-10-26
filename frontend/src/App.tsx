import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';

function SessionPage() {
  const { user, signOut, isLoading, error } = useAuth();

  if (isLoading) {
    return <main className="session-loading" role="status">Restoring your session…</main>;
  }
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <main className="session-page">
      <section className="session-card">
        <span className="session-check" aria-hidden="true">✓</span>
        <p className="eyebrow">You’re signed in</p>
        <h1>Welcome, {user.fullname || user.email}</h1>
        <p>Your Marketly account is ready.</p>
        {error && <p className="session-notice" role="status">{error}</p>}
        <button className="submit-button" type="button" onClick={signOut}>Sign out</button>
      </section>
    </main>
  );
}

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) return <main className="session-loading" role="status">Loading account…</main>;

  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/" element={<SessionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
