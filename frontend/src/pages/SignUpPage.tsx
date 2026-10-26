import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignUpForm } from '../components/auth/SignUpForm';

export function SignUpPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return (
    <AuthLayout
      variant="sign-up"
      title="Welcome Back"
      description="Sign up to continue shopping"
      footer={<>Already have an account? <Link to="/signin">Sign In</Link></>}
    >
      <SignUpForm />
    </AuthLayout>
  );
}
