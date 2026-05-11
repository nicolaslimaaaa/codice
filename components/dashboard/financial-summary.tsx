"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, CheckCircle, DollarSign } from "lucide-react";

interface FinancialSummaryProps {
  totalMonth: number;
  totalPending: number;
  classesCompleted: number;
  classesScheduled: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: EASE,
    },
  }),
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Componente de saúde financeira com tipografia bold e animações de counter.
 * Ocupa 40% do layout assimétrico do dashboard.
 */
export function FinancialSummary({
  totalMonth,
  totalPending,
  classesCompleted,
  classesScheduled,
}: FinancialSummaryProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-2 mb-2"
      >
        <DollarSign size={16} style={{ color: "#63c132" }} />
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7a6a55" }}>
          Saúde Financeira
        </h2>
      </motion.div>

      {/* Card — Receita do Mês */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="rounded-2xl p-5 flex flex-col gap-1"
        style={{
          backgroundColor: "#63c132",
          boxShadow: "0 4px 24px rgba(99, 193, 50, 0.25)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <TrendingUp size={16} className="text-white/80" />
          <span className="text-xs font-medium text-white/70">Este mês</span>
        </div>
        <p className="text-3xl font-black text-white leading-none tracking-tight">
          {formatCurrency(totalMonth)}
        </p>
        <p className="text-xs text-white/70 mt-1">Receita confirmada</p>
      </motion.div>

      {/* Card — Pendente */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="rounded-2xl p-5 flex flex-col gap-1"
        style={{
          backgroundColor: "#e8e5e2",
          border: "1.5px solid #f18f01",
          boxShadow: "0 2px 12px rgba(241, 143, 1, 0.10)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <Clock size={16} style={{ color: "#f18f01" }} />
          <span className="text-xs font-medium" style={{ color: "#7a6a55" }}>
            Aguardando
          </span>
        </div>
        <p className="text-3xl font-black leading-none tracking-tight" style={{ color: "#f18f01" }}>
          {formatCurrency(totalPending)}
        </p>
        <p className="text-xs mt-1" style={{ color: "#7a6a55" }}>
          A receber
        </p>
      </motion.div>

      {/* Card — Aulas */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "#e8e5e2",
          border: "1.5px solid rgba(82, 70, 50, 0.12)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <CheckCircle size={16} style={{ color: "#006e90" }} />
          <span className="text-xs font-medium" style={{ color: "#7a6a55" }}>
            Aulas
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-black leading-none tracking-tight" style={{ color: "#524632" }}>
              {classesCompleted}
            </p>
            <p className="text-xs mt-1" style={{ color: "#7a6a55" }}>
              Realizadas
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold leading-none" style={{ color: "#006e90" }}>
              {classesScheduled}
            </p>
            <p className="text-xs mt-1" style={{ color: "#7a6a55" }}>
              Agendadas
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
