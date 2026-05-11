"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  LogOut,
  User,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { id: "students", label: "Alunos", href: "/dashboard/students", icon: Users },
  { id: "materials", label: "Materiais", href: "/dashboard/materials", icon: FileText },
  { id: "financial", label: "Financeiro", href: "/dashboard/financial", icon: DollarSign },
];

interface NavigationDockProps {
  avatarUrl?: string | null;
  userName?: string | null;
}

/**
 * Dock de navegação inferior glassmorphism.
 * Layout mobile-first com active indicator animado (Framer Motion layoutId).
 */
export function NavigationDock({ avatarUrl, userName }: NavigationDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-0"
      aria-label="Navegação principal"
    >
      {/* Container do dock */}
      <div
        className="glass rounded-2xl mx-auto max-w-md shadow-lg"
        style={{
          background: "rgba(222, 219, 216, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(82, 70, 50, 0.12)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {/* Avatar / Perfil */}
          <button
            id="nav-profile"
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 hover:bg-[#524632]/8 group"
            aria-label={`${userName ?? "Perfil"} — Sair`}
            title="Sair"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#63c132]/20 flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userName ?? "Avatar"}
                  width={28}
                  height={28}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User size={14} style={{ color: "#63c132" }} />
              )}
            </div>
            <span className="text-[10px] font-medium" style={{ color: "#7a6a55" }}>
              Sair
            </span>
          </button>

          {/* Itens de navegação */}
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => router.push(item.href)}
                className="relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 hover:bg-[#524632]/8"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "rgba(99, 193, 50, 0.15)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon
                  size={20}
                  style={{
                    color: isActive ? "#63c132" : "#7a6a55",
                    transition: "color 0.2s",
                  }}
                />
                <span
                  className="text-[10px] font-medium relative z-10"
                  style={{
                    color: isActive ? "#63c132" : "#7a6a55",
                    transition: "color 0.2s",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Ícone de logout extra no final */}
          <button
            id="nav-logout"
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 hover:bg-red-50 group"
            aria-label="Sair da conta"
          >
            <LogOut
              size={20}
              className="group-hover:text-red-400 transition-colors"
              style={{ color: "#7a6a55" }}
            />
            <span
              className="text-[10px] font-medium group-hover:text-red-400 transition-colors"
              style={{ color: "#7a6a55" }}
            >
              Sair
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
