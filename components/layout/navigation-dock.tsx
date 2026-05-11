"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  User,
} from "lucide-react";
import Image from "next/image";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Início",     href: "/",          icon: LayoutDashboard },
  { id: "students",  label: "Alunos",     href: "/students",  icon: Users           },
  { id: "materials", label: "Materiais",  href: "/materials", icon: FileText        },
  { id: "financial", label: "Financeiro", href: "/financial", icon: DollarSign      },
  { id: "profile",   label: "Perfil",     href: "/profile",   icon: User            },
];

interface NavigationDockProps {
  avatarUrl?: string | null;
  userName?: string | null;
}

/**
 * Dock de navegação inferior glassmorphism.
 * 5 itens — padrão HIG: Início à esquerda, Perfil à direita.
 * Logout movido para dentro da página de Perfil.
 */
export function NavigationDock({ avatarUrl, userName }: NavigationDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-0"
      aria-label="Navegação principal"
    >
      <div
        className="rounded-2xl mx-auto max-w-md shadow-lg"
        style={{
          background: "rgba(222, 219, 216, 0.80)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(82, 70, 50, 0.12)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isProfile = item.id === "profile";

            // Perfil: ativo quando pathname inicia com /profile
            // Início: ativo apenas em pathname === "/"
            const isActive = isProfile
              ? pathname.startsWith("/profile")
              : item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

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

                {/* Ícone — Perfil usa avatar se disponível */}
                <div className="relative z-10">
                  {isProfile && avatarUrl ? (
                    <div
                      className="w-5 h-5 rounded-full overflow-hidden"
                      style={{
                        outline: isActive ? "2px solid #63c132" : "2px solid transparent",
                        outlineOffset: "1px",
                      }}
                    >
                      <Image
                        src={avatarUrl}
                        alt={userName ?? "Avatar"}
                        width={20}
                        height={20}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <item.icon
                      size={20}
                      style={{
                        color: isActive ? "#63c132" : "#7a6a55",
                        transition: "color 0.2s",
                      }}
                    />
                  )}
                </div>

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
        </div>
      </div>
    </nav>
  );
}
