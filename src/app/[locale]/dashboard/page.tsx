import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardClient } from "@/components/DashboardClient";
import { getDictionary } from "@/lib/dictionaries";
import { Params } from "@/types/config";

export default async function DashboardPage({ params }: { params: Params }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as "en" | "uk");

  return (
    <ProtectedRoute>
      <DashboardClient locale={locale} dictionary={dictionary} />
    </ProtectedRoute>
  );
}
