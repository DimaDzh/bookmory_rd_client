import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginForm } from "@/components/auth/LoginForm";
import { getDictionary } from "@/lib/dictionaries";
import { Params } from "@/types/config";

export default async function LoginPage({ params }: { params: Params }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as "en" | "uk");

  return (
    <ProtectedRoute requireAuth={false}>
      <LoginForm locale={locale} dictionary={dictionary} />
    </ProtectedRoute>
  );
}
