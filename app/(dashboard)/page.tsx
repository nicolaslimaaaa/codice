"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen } from "lucide-react";
import { ClassesTimeline } from "@/components/dashboard/classes-timeline";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { StudentFormSheet } from "@/components/students/student-form-sheet";
import { useClasses } from "@/hooks/use-classes";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];


/**
 * Página principal do Dashboard.
 * Layout assimétrico: 60% Timeline de aulas | 40% Saúde Financeira.
 * Client Component para suporte ao Framer Motion e interatividade.
 */
export default function DashboardPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { classes, loading, refetch } = useClasses();

  // Cálculos financeiros derivados das aulas
  const totalMonth = classes
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.price, 0);

  const totalPending = classes
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.price, 0);

  const classesCompleted = classes.filter(
    (c) => c.status === "completed" || c.status === "paid"
  ).length;

  const classesScheduled = classes.filter((c) => c.status === "scheduled").length;

  // Próximas aulas (scheduled + futuras completed)
  const upcomingClasses = classes.filter((c) => c.status === "scheduled");

  return (
    <div className="min-h-screen p-4 pt-6 md:p-8 md:pt-8" style={{ backgroundColor: "#dedbd8" }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#63c132" }}
          >
            <BookOpen size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "#524632" }}>
            Códice
          </h1>
        </div>

        {/* Botão novo aluno */}
        <motion.button
          id="dashboard-new-student"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: "#63c132" }}
          aria-label="Cadastrar novo aluno"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Aluno</span>
        </motion.button>
      </motion.header>

      {/* Layout assimétrico principal */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[60fr_40fr] lg:gap-8 lg:items-start">
        {/* 60% — Timeline de Aulas */}
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="lg:min-h-[600px]"
          aria-label="Próximas aulas"
        >
          <ClassesTimeline classes={upcomingClasses} loading={loading} />
        </motion.section>

        {/* 40% — Saúde Financeira */}
        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          aria-label="Resumo financeiro"
        >
          <FinancialSummary
            totalMonth={totalMonth}
            totalPending={totalPending}
            classesCompleted={classesCompleted}
            classesScheduled={classesScheduled}
          />
        </motion.section>
      </div>

      {/* Sheet de cadastro de aluno */}
      <StudentFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
