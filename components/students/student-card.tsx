"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, GraduationCap, School, ChevronRight } from "lucide-react";
import type { Student } from "@/hooks/use-students";

interface StudentCardProps {
  student: Student;
  onDelete: (id: string) => void;
  deleting?: boolean;
  onClick?: () => void;
}

/**
 * Card de aluno com confirmação de exclusão inline.
 * Clicar na área de nome/avatar abre o detalhe do aluno.
 */
export function StudentCard({ student, onDelete, deleting, onClick }: StudentCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Gera iniciais do nome para o avatar
  const initials = student.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // Cor do avatar baseada na inicial (determinística)
  const avatarColors = [
    { bg: "rgba(99, 193, 50, 0.15)",  text: "#57ad2b" },
    { bg: "rgba(0, 110, 144, 0.12)",  text: "#006e90" },
    { bg: "rgba(241, 143, 1, 0.12)",  text: "#c87800" },
    { bg: "rgba(82, 70, 50, 0.10)",   text: "#524632" },
  ];
  const color = avatarColors[student.name.charCodeAt(0) % avatarColors.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "#e8e5e2",
        border: "1px solid rgba(82, 70, 50, 0.10)",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* Área clicável — avatar + dados */}
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
          aria-label={`Ver detalhes de ${student.name}`}
        >
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {initials}
          </div>

          {/* Dados */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#524632" }}>
              {student.name}
            </p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {student.grade && (
                <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#7a6a55" }}>
                  <GraduationCap size={11} />
                  {student.grade}
                </span>
              )}
              {student.school && (
                <span className="inline-flex items-center gap-1 text-xs truncate" style={{ color: "#7a6a55" }}>
                  <School size={11} />
                  {student.school}
                </span>
              )}
              {!student.grade && !student.school && (
                <span className="text-xs" style={{ color: "#9a8a75" }}>
                  Sem informações adicionais
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Ações — fora do botão clicável */}
        <AnimatePresence mode="wait">
          {confirmDelete ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: "rgba(82, 70, 50, 0.08)", color: "#524632" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => onDelete(student.id)}
                disabled={deleting}
                className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.10)", color: "#ef4444" }}
              >
                {deleting ? "…" : "Excluir"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 flex-shrink-0"
            >
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl transition-colors hover:bg-red-50 group"
                aria-label="Excluir aluno"
              >
                <Trash2
                  size={15}
                  className="group-hover:text-red-400 transition-colors"
                  style={{ color: "#9a8a75" }}
                />
              </button>
              <ChevronRight size={15} style={{ color: "#c4b9a8" }} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
