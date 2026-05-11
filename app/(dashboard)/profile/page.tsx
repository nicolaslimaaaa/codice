"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, LogOut, Construction, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: EASE },
  }),
};

export default function ProfilePage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <main
      className="flex-1 flex flex-col p-5 pb-28"
      style={{ minHeight: "100dvh" }}
    >
      <motion.div initial="hidden" animate="visible" className="max-w-sm mx-auto w-full">

        {/* Cabeçalho */}
        <motion.div custom={0} variants={fadeUp} className="mb-8 pt-4">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#524632" }}>
            Meu Perfil
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7a6a55" }}>
            Gerencie sua conta e preferências
          </p>
        </motion.div>

        {/* Avatar placeholder */}
        <motion.div custom={1} variants={fadeUp} className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(82, 70, 50, 0.08)" }}
          >
            <User size={28} style={{ color: "#524632" }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#524632" }}>
              Professor
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#7a6a55" }}>
              Editar informações em breve
            </p>
          </div>
        </motion.div>

        {/* Seção: em desenvolvimento */}
        <motion.div custom={2} variants={fadeUp} className="mb-6">
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: "rgba(241, 143, 1, 0.08)",
              border: "1px solid rgba(241, 143, 1, 0.18)",
            }}
          >
            <Construction size={16} style={{ color: "#f18f01" }} />
            <p className="text-xs leading-relaxed" style={{ color: "#7a6a55" }}>
              A edição de perfil está em desenvolvimento. Em breve você poderá atualizar foto, nome e dados da conta.
            </p>
          </div>
        </motion.div>

        {/* Opções futuras (visuais) */}
        {["Alterar foto de perfil", "Editar nome", "Alterar senha"].map(
          (label, i) => (
            <motion.div
              key={label}
              custom={3 + i}
              variants={fadeUp}
            >
              <button
                disabled
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl mb-2 opacity-40 cursor-not-allowed"
                style={{
                  backgroundColor: "rgba(82, 70, 50, 0.05)",
                  border: "1px solid rgba(82, 70, 50, 0.08)",
                }}
              >
                <span className="text-sm font-medium" style={{ color: "#524632" }}>
                  {label}
                </span>
                <ChevronRight size={16} style={{ color: "#7a6a55" }} />
              </button>
            </motion.div>
          )
        )}

        {/* Separador */}
        <motion.hr
          custom={6}
          variants={fadeUp}
          className="my-6"
          style={{ borderColor: "rgba(82, 70, 50, 0.12)" }}
        />

        {/* Botão Sair — ação destrutiva */}
        <motion.div custom={7} variants={fadeUp}>
          <button
            id="profile-signout"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{
              backgroundColor: signingOut
                ? "rgba(239, 68, 68, 0.06)"
                : "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.20)",
              color: "#ef4444",
            }}
          >
            <LogOut size={16} />
            {signingOut ? "Saindo…" : "Sair da conta"}
          </button>
        </motion.div>

      </motion.div>
    </main>
  );
}
