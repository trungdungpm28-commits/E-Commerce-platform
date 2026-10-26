import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignInForm } from '../components/auth/SignInForm';

export function SignInPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return (
    <AuthLayout
      variant="sign-in"
      title="Welcome Back"
      description="Sign in to continue shopping"
      footer={<>Don’t have an account? <Link to="/signup">Sign Up</Link></>}
    >
      <SignInForm />
    </AuthLayout>
  );
}
