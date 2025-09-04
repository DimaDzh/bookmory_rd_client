import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getDictionary } from "@/lib/dictionaries";
import { Params } from "@/types/config";

export default async function RegisterPage({ params }: { params: Params }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as "en" | "uk");

  return (
    <ProtectedRoute requireAuth={false}>
      <RegisterForm locale={locale} dictionary={dictionary} />
    </ProtectedRoute>
  );
}
