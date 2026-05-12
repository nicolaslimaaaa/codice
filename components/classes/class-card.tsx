"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, DollarSign } from "lucide-react";
import type { ClassWithStudent, ClassStatus } from "@/hooks/use-classes";

interface ClassCardProps {
  lesson: ClassWithStudent;
  onStatusChange: (id: string, current: ClassStatus) => void;
  updatingId?: string | null;
}

// Configuração visual de cada status
const STATUS_CONFIG: Record<
  ClassStatus,
  { label: string; bg: string; text: string; nextLabel: string }
> = {
  scheduled: {
    label: "Agendada",
    nextLabel: "Marcar como concluída",
    bg: "rgba(241, 143, 1, 0.12)",
    text: "#c87800",
  },
  completed: {
    label: "Concluída",
    nextLabel: "Marcar como paga",
    bg: "rgba(0, 110, 144, 0.12)",
    text: "#006e90",
  },
  paid: {
    label: "Paga",
    nextLabel: "Reabrir como agendada",
    bg: "rgba(99, 193, 50, 0.15)",
    text: "#57ad2b",
  },
};

// Paleta de avatares determinística
const AVATAR_COLORS = [
  { bg: "rgba(99, 193, 50, 0.18)", text: "#57ad2b" },
  { bg: "rgba(0, 110, 144, 0.14)", text: "#006e90" },
  { bg: "rgba(241, 143, 1, 0.14)", text: "#c87800" },
  { bg: "rgba(82, 70, 50, 0.12)",  text: "#524632" },
];

/** Formata "HH:MM:SS" → "HH:MM" */
function fmtTime(t: string) {
  return t.slice(0, 5);
}

/** Calcula duração em minutos entre dois "HH:MM:SS" */
function durationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

/** Formata duração em "1h30" ou "45min" */
function fmtDuration(min: number): string {
  if (min <= 0) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}`;
}

/**
 * Card de aula individual.
 * Badge de status é clicável e cicla: scheduled → completed → paid → scheduled.
 */
export function ClassCard({ lesson, onStatusChange, updatingId }: ClassCardProps) {
  const student = lesson.students;
  const statusCfg = STATUS_CONFIG[lesson.status];
  const isUpdating = updatingId === lesson.id;

  // Avatar
  const name = student?.name ?? "—";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const dur = durationMinutes(lesson.start_time, lesson.end_time);
  const price = Number(lesson.price);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.18 } }}
      transition={{ duration: 0.28 }}
      className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
      style={{
        backgroundColor: "#e8e5e2",
        border: "1px solid rgba(82, 70, 50, 0.10)",
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {initials}
      </div>

      {/* Dados principais */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#524632" }}>
          {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Horário */}
          <span
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "#7a6a55" }}
          >
            <Clock size={11} />
            {fmtTime(lesson.start_time)} – {fmtTime(lesson.end_time)}
            {dur > 0 && (
              <span style={{ color: "#9a8a75" }}>({fmtDuration(dur)})</span>
            )}
          </span>

          {/* Valor */}
          {price > 0 && (
            <span
              className="inline-flex items-center gap-1 text-xs"
              style={{ color: "#7a6a55" }}
            >
              <DollarSign size={11} />
              {price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Badge de status clicável */}
      <button
        type="button"
        onClick={() => onStatusChange(lesson.id, lesson.status)}
        disabled={isUpdating}
        title={statusCfg.nextLabel}
        className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: statusCfg.bg,
          color: statusCfg.text,
          opacity: isUpdating ? 0.5 : 1,
        }}
      >
        {isUpdating ? "…" : statusCfg.label}
      </button>
    </motion.div>
  );
}
