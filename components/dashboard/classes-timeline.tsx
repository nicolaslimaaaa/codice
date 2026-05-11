"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import type { ClassWithStudent } from "@/hooks/use-classes";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ClassesTimelineProps {
  classes: ClassWithStudent[];
  loading?: boolean;
}

const STATUS_CONFIG = {
  scheduled: {
    label: "Agendada",
    icon: Circle,
    color: "#006e90",
    bg: "rgba(0, 110, 144, 0.10)",
  },
  completed: {
    label: "Realizada",
    icon: CheckCircle2,
    color: "#63c132",
    bg: "rgba(99, 193, 50, 0.10)",
  },
  paid: {
    label: "Pago",
    icon: CheckCircle2,
    color: "#524632",
    bg: "rgba(82, 70, 50, 0.08)",
  },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === tomorrow.toDateString()) return "Amanhã";

  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ backgroundColor: "#e8e5e2" }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#524632]/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded-lg bg-[#524632]/10" />
          <div className="h-3 w-1/3 rounded-lg bg-[#524632]/8" />
        </div>
      </div>
    </div>
  );
}

/**
 * Timeline vertical de aulas com AnimatePresence e layout animations.
 * Ocupa 60% do layout assimétrico do dashboard.
 */
export function ClassesTimeline({ classes, loading }: ClassesTimelineProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-2 mb-5"
      >
        <Calendar size={16} style={{ color: "#63c132" }} />
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7a6a55" }}>
          Próximas Aulas
        </h2>
      </motion.div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : classes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-3"
          >
            <AlertCircle size={32} style={{ color: "#524632", opacity: 0.3 }} />
            <p className="text-sm text-center" style={{ color: "#7a6a55" }}>
              Nenhuma aula agendada
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {classes.map((cls, i) => {
              const status = STATUS_CONFIG[cls.status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={cls.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.5,
                    ease: EASE,
                  }}
                  whileHover={{ scale: 1.015, y: -2 }}
                  className="rounded-2xl p-4 cursor-default transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: "#e8e5e2",
                    border: "1px solid rgba(82, 70, 50, 0.08)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone de status */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: status.bg }}
                    >
                      <StatusIcon size={16} style={{ color: status.color }} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm truncate" style={{ color: "#524632" }}>
                          {cls.students?.name ?? "Aluno não encontrado"}
                        </p>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5">
                        {/* Data */}
                        <div className="flex items-center gap-1">
                          <Calendar size={11} style={{ color: "#7a6a55" }} />
                          <span className="text-[11px]" style={{ color: "#7a6a55" }}>
                            {formatDate(cls.date)}
                          </span>
                        </div>

                        {/* Horário */}
                        <div className="flex items-center gap-1">
                          <Clock size={11} style={{ color: "#7a6a55" }} />
                          <span className="text-[11px]" style={{ color: "#7a6a55" }}>
                            {formatTime(cls.start_time)} – {formatTime(cls.end_time)}
                          </span>
                        </div>

                        {/* Série (se existir) */}
                        {cls.students?.grade && (
                          <div className="flex items-center gap-1">
                            <User size={11} style={{ color: "#7a6a55" }} />
                            <span className="text-[11px]" style={{ color: "#7a6a55" }}>
                              {cls.students.grade}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Valor */}
                    <p className="text-sm font-bold flex-shrink-0" style={{ color: "#63c132" }}>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 0,
                      }).format(cls.price)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
