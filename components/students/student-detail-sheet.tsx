"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  GraduationCap,
  School,
  MapPin,
  FileText,
  Trash2,
  Calendar,
} from "lucide-react";
import type { Student } from "@/hooks/use-students";

interface StudentDetailSheetProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-3.5 px-4" style={{ borderBottom: "1px solid rgba(82,70,50,0.08)" }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: "rgba(99,193,50,0.10)" }}
      >
        <Icon size={14} style={{ color: "#63c132" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: "#9a8a75" }}>
          {label}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#524632" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Sheet de detalhes do aluno.
 * Exibe todas as informações cadastradas e permite excluir.
 */
export function StudentDetailSheet({
  student,
  open,
  onOpenChange,
  onDelete,
  deleting,
}: StudentDetailSheetProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!student) return null;

  // Iniciais para o avatar
  const initials = student.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const avatarColors = [
    { bg: "rgba(99, 193, 50, 0.18)", text: "#57ad2b" },
    { bg: "rgba(0, 110, 144, 0.14)", text: "#006e90" },
    { bg: "rgba(241, 143, 1, 0.14)", text: "#c87800" },
    { bg: "rgba(82, 70, 50, 0.12)", text: "#524632" },
  ];
  const color = avatarColors[student.name.charCodeAt(0) % avatarColors.length];

  const createdAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(student.created_at));

  function handleDelete() {
    onDelete(student!.id);
    onOpenChange(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setConfirmDelete(false);
        onOpenChange(v);
      }}
    >
      <SheetContent
        side="right"
        style={{
          backgroundColor: "#e8e5e2",
          borderLeft: "1px solid rgba(82, 70, 50, 0.12)",
        }}
      >
        {/* Cabeçalho */}
        <SheetHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center gap-3 pr-8">
            {/* Avatar com iniciais */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-bold"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {initials}
            </div>
            <div>
              <SheetTitle
                className="text-base font-bold leading-tight"
                style={{ color: "#524632" }}
              >
                {student.name}
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5" style={{ color: "#7a6a55" }}>
                Ficha do aluno
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">

          {/* Data de cadastro */}
          <p className="text-xs mb-4" style={{ color: "#9a8a75" }}>
            Cadastrado em {createdAt}
          </p>

          {/* Informações */}
          <div className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: "#dedad7" }}>
            <InfoRow icon={GraduationCap} label="Série / Ano" value={student.grade} />
            <InfoRow icon={School}       label="Escola"       value={student.school} />
            <InfoRow icon={MapPin}       label="Endereço"     value={student.address} />
            <InfoRow icon={FileText}     label="Observações"  value={student.notes} />
          </div>

          {/* Sem informações adicionais */}
          {!student.grade && !student.school && !student.address && !student.notes && (
            <p className="text-sm text-center py-4" style={{ color: "#9a8a75" }}>
              Nenhuma informação adicional cadastrada.
            </p>
          )}

          {/* Aulas futuras — placeholder */}
          <div
            className="rounded-2xl p-4 mb-5 flex items-center gap-3"
            style={{
              backgroundColor: "rgba(0, 110, 144, 0.06)",
              border: "1px solid rgba(0, 110, 144, 0.12)",
            }}
          >
            <Calendar size={16} style={{ color: "#006e90" }} />
            <p className="text-xs" style={{ color: "#7a6a55" }}>
              Histórico de aulas disponível em breve.
            </p>
          </div>

          {/* Zona de exclusão */}
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.06)",
                  border: "1px solid rgba(239, 68, 68, 0.18)",
                }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "#ef4444" }}>
                  Excluir aluno?
                </p>
                <p className="text-xs mb-4" style={{ color: "#7a6a55" }}>
                  Esta ação é irreversível. Todos os dados de{" "}
                  <strong style={{ color: "#524632" }}>{student.name}</strong> serão
                  removidos.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: "rgba(82, 70, 50, 0.08)",
                      color: "#524632",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.12)",
                      color: "#ef4444",
                    }}
                  >
                    {deleting ? "Excluindo…" : "Confirmar exclusão"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="delete-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.16)",
                  color: "#ef4444",
                }}
              >
                <Trash2 size={15} />
                Excluir aluno
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
