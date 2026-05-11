import { redirect } from "next/navigation";

/**
 * Rota raiz — redireciona para o dashboard.
 * O middleware cuida da proteção: se não autenticado, vai para /auth/login.
 */
export default function RootPage() {
  redirect("/dashboard");
}
