import LoginForm from '@/components/auth/LoginForm';
import AuthRedirect from '@/components/auth/AuthRedirect';

export default function LoginPage() {
  return (
    <AuthRedirect redirectType="authenticated" redirectTo="/dashboard">
      <LoginForm />
    </AuthRedirect>
  );
}