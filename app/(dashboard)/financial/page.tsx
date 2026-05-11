"use client";

import { motion } from "framer-motion";
import { DollarSign, Construction } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function FinancialPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-center max-w-sm"
      >
        {/* Ícone */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "rgba(99, 193, 50, 0.12)" }}
        >
          <DollarSign size={36} style={{ color: "#63c132" }} />
        </div>

        <h1
          className="text-2xl font-bold mb-2 tracking-tight"
          style={{ color: "#524632" }}
        >
          Financeiro
        </h1>

        <p className="text-sm leading-relaxed mb-4" style={{ color: "#7a6a55" }}>
          Acompanhe receitas, pagamentos e o histórico financeiro das suas aulas.
        </p>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "rgba(241, 143, 1, 0.10)",
            color: "#f18f01",
            border: "1px solid rgba(241, 143, 1, 0.20)",
          }}
        >
          <Construction size={12} />
          Em desenvolvimento
        </div>
      </motion.div>
    </main>
  );
}
