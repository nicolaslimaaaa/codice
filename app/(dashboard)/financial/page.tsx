"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, CalendarDays, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useFinancial } from "@/hooks/use-financial";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function FinancialPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [filterMode, setFilterMode] = useState<"month" | "all">("month");

  const { totals, pendingByStudent, loading, markAsPaid } = useFinancial(
    filterMode === "month" ? selectedMonth : undefined,
    filterMode === "month" ? selectedYear : undefined
  );

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <main className="flex flex-col p-5 pb-28" style={{ minHeight: "100dvh" }}>
      {/* ── Cabeçalho e Filtro ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-center justify-between pt-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#524632" }}>
            Financeiro
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7a6a55" }}>
            Controle de receitas e pendências
          </p>
        </div>

        <select
          value={filterMode === "all" ? "all" : selectedMonth}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "all") {
              setFilterMode("all");
            } else {
              setFilterMode("month");
              setSelectedMonth(Number(val));
            }
          }}
          className="px-3 py-2 rounded-xl text-sm outline-none transition-all duration-200 bg-white/40 border shadow-sm backdrop-blur-sm border-[#524632]/15 hover:border-[#524632]/30 focus:border-[#63c132] focus:ring-1 focus:ring-[#63c132]/20"
          style={{ color: "#524632", fontWeight: 500 }}
        >
          <option value="all">Todo o Período</option>
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
      </motion.div>

      {/* ── Cards de Resumo ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
          className="p-5 rounded-2xl bg-white/40 border border-[#524632]/10 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 size={64} style={{ color: "#63c132" }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-sm font-semibold mb-1" style={{ color: "#7a6a55" }}>Já Recebido</h2>
            <div className="text-2xl font-bold" style={{ color: "#63c132" }}>
              {loading ? "R$ --,--" : formatCurrency(totals.paid)}
            </div>
            <p className="text-xs mt-2 font-medium" style={{ color: "#63c132" }}>
              Aulas marcadas como pagas
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
          className="p-5 rounded-2xl bg-white/40 border border-[#524632]/10 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle size={64} style={{ color: "#f59e0b" }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-sm font-semibold mb-1" style={{ color: "#7a6a55" }}>Concluídas (A Receber)</h2>
            <div className="text-2xl font-bold" style={{ color: "#524632" }}>
              {loading ? "R$ --,--" : formatCurrency(totals.completedUnpaid)}
            </div>
            <p className="text-xs mt-2 font-medium" style={{ color: "#f59e0b" }}>
              Aulas realizadas e não pagas
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
          className="p-5 rounded-2xl bg-white/40 border border-[#524632]/10 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CalendarDays size={64} style={{ color: "#3b82f6" }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-sm font-semibold mb-1" style={{ color: "#7a6a55" }}>Agendadas</h2>
            <div className="text-2xl font-bold" style={{ color: "#524632" }}>
              {loading ? "R$ --,--" : formatCurrency(totals.scheduled)}
            </div>
            <p className="text-xs mt-2 font-medium" style={{ color: "#3b82f6" }}>
              Aulas futuras a receber
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Lista de Pendências por Aluno ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: "#524632" }}>
          Alunos com Pendências
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-[#524632]/5 animate-pulse" />
            ))}
          </div>
        ) : pendingByStudent.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white/30 rounded-2xl border border-[#524632]/10 text-center">
            <DollarSign size={32} className="mb-3" style={{ color: "#c4b9a8" }} />
            <p className="text-sm font-medium" style={{ color: "#524632" }}>Nenhuma aula pendente.</p>
            <p className="text-xs mt-1" style={{ color: "#7a6a55" }}>Todas as aulas deste período já foram pagas!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingByStudent.map((studentGroup) => (
              <StudentPendingCard 
                key={studentGroup.studentId} 
                studentGroup={studentGroup} 
                onMarkAsPaid={markAsPaid}
              />
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}

// ── Componente Interno para o Accordion de Alunos ──

function StudentPendingCard({ 
  studentGroup, 
  onMarkAsPaid 
}: { 
  studentGroup: any, 
  onMarkAsPaid: (id: string) => Promise<boolean> 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const totalPendente = studentGroup.totalCompleted + studentGroup.totalScheduled;

  return (
    <div className="bg-white/50 border border-[#524632]/15 rounded-2xl overflow-hidden shadow-sm transition-colors hover:bg-white/70">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div>
          <h3 className="font-bold text-base" style={{ color: "#524632" }}>
            {studentGroup.studentName}
          </h3>
          <p className="text-xs font-medium mt-0.5" style={{ color: "#7a6a55" }}>
            {studentGroup.classes.length} aula(s) pendente(s)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-sm font-bold" style={{ color: "#f59e0b" }}>
              {formatCurrency(studentGroup.totalCompleted)}
            </span>
            {studentGroup.totalScheduled > 0 && (
              <span className="block text-[10px] font-medium opacity-70" style={{ color: "#3b82f6" }}>
                + {formatCurrency(studentGroup.totalScheduled)} (agendado)
              </span>
            )}
          </div>
          <div className="p-1 rounded-full bg-[#524632]/5">
            {isOpen ? <ChevronUp size={16} color="#524632" /> : <ChevronDown size={16} color="#524632" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#524632]/[0.02] border-t border-[#524632]/10"
          >
            <div className="p-4 space-y-3">
              {studentGroup.classes.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-[#524632]/5">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#524632" }}>
                      {new Date(c.date).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })} • {c.start_time.slice(0, 5)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{ 
                          backgroundColor: c.status === "completed" ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)",
                          color: c.status === "completed" ? "#f59e0b" : "#3b82f6" 
                        }}
                      >
                        {c.status === "completed" ? "Concluída" : "Agendada"}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "#524632" }}>
                        {formatCurrency(c.price)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsPaid(c.id);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:brightness-105 active:scale-95"
                    style={{ backgroundColor: "#63c132" }}
                  >
                    Marcar Pago
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
