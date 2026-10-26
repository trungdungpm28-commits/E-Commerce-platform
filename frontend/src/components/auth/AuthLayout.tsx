import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  variant: 'sign-in' | 'sign-up';
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ variant, title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="figma-auth-page">
      <section className={`figma-auth-card ${variant}`} aria-labelledby="auth-title">
        <div className="auth-heading">
          <Link className="auth-brand" to="/signin">E-Commerce Platform</Link>
          <h1 id="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
        </div>
        {children}
        <div className="auth-footer">{footer}</div>
      </section>
    </main>
  );
}
