import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavigationDock } from "@/components/layout/navigation-dock";

/**
 * Layout do grupo de rotas protegidas /(dashboard).
 * Valida sessão no servidor e injeta o dock de navegação.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Busca perfil do usuário para o avatar
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#dedbd8" }}>
      {/* Conteúdo da página com espaçamento para o dock */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Dock de navegação fixo */}
      <NavigationDock
        avatarUrl={profile?.avatar_url}
        userName={profile?.name}
      />
    </div>
  );
}
