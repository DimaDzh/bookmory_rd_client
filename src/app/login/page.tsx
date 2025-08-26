import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <LoginForm />
    </ProtectedRoute>
  );
}
