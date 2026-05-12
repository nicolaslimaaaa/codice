"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, BookOpen, FileText, ChevronRight } from "lucide-react";
import {
  useClasses,
  useUpdateClassStatus,
  type ClassStatus,
  type ClassWithStudent,
} from "@/hooks/use-classes";
import { ClassCard } from "@/components/classes/class-card";
import { ClassFormSheet } from "@/components/classes/class-form-sheet";

// ─── Tipos de filtro ──────────────────────────────────────────────────────────

type Filter = "all" | ClassStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",       label: "Todas"      },
  { key: "scheduled", label: "Agendadas"  },
  { key: "completed", label: "Concluídas" },
  { key: "paid",      label: "Pagas"      },
];

// ─── Agrupamento por data ─────────────────────────────────────────────────────

interface DateGroup {
  label: string;
  dateKey: string;
  items: ClassWithStudent[];
}

function groupByDate(classes: ClassWithStudent[]): DateGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 6);

  // Agrupa por string de data
  const map = new Map<string, ClassWithStudent[]>();
  for (const c of classes) {
    const list = map.get(c.date) ?? [];
    list.push(c);
    map.set(c.date, list);
  }

  // Transforma em array de grupos ordenados
  const groups: DateGroup[] = [];
  for (const [dateKey, items] of map) {
    const d = new Date(dateKey + "T00:00:00");
    let label: string;

    if (d.getTime() === today.getTime()) {
      label = "Hoje";
    } else if (d.getTime() === tomorrow.getTime()) {
      label = "Amanhã";
    } else {
      label = d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
      // Capitaliza
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }

    groups.push({ label, dateKey, items });
  }

  // Passadas aparecem no final, futuras no topo
  return groups.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

// ─── Animações ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ClassesPage() {
  const router = useRouter();
  const { classes, loading, refetch } = useClasses();
  const { cycleStatus } = useUpdateClassStatus();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filtra pelo status selecionado
  const filtered = useMemo(() => {
    if (filter === "all") return classes;
    return classes.filter((c) => c.status === filter);
  }, [classes, filter]);

  // Agrupa por data
  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  async function handleStatusChange(id: string, current: ClassStatus) {
    setUpdatingId(id);
    const next = await cycleStatus(id, current);
    if (next) refetch();
    setUpdatingId(null);
  }

  return (
    <>
      <main className="flex flex-col p-5 pb-28" style={{ minHeight: "100dvh" }}>

        {/* ── Cabeçalho ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center justify-between pt-4 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#524632" }}>
              Aulas
            </h1>
            {!loading && (
              <p className="text-sm mt-0.5" style={{ color: "#7a6a55" }}>
                {classes.length === 0
                  ? "Nenhuma aula cadastrada"
                  : `${classes.length} aula${classes.length !== 1 ? "s" : ""} no total`}
              </p>
            )}
          </div>

          {/* Botão nova aula */}
          <motion.button
            id="add-class-btn"
            whileTap={{ scale: 0.94 }}
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: "#63c132" }}
            aria-label="Nova aula"
          >
            <CalendarDays size={16} />
            <span>Nova</span>
          </motion.button>
        </motion.div>

        {/* ── Chips de filtro ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASE }}
          className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1"
          style={{ scrollbarWidth: "none" }}
        >
          {FILTERS.map(({ key, label }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: isActive
                    ? "#63c132"
                    : "rgba(82, 70, 50, 0.08)",
                  color: isActive ? "#fff" : "#7a6a55",
                }}
              >
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* ── Skeleton loading ── */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className="h-4 w-28 rounded-lg animate-pulse"
                  style={{ backgroundColor: "rgba(82, 70, 50, 0.10)" }}
                />
                <div
                  className="h-[68px] rounded-2xl animate-pulse"
                  style={{ backgroundColor: "rgba(82, 70, 50, 0.07)" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Timeline agrupada ── */}
        {!loading && groups.length > 0 && (
          <div className="flex flex-col gap-5">
            <AnimatePresence>
              {groups.map(({ label, dateKey, items }) => (
                <motion.section
                  key={dateKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {/* Label da data */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#7a6a55" }}
                    >
                      {label}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: "rgba(82, 70, 50, 0.10)" }}
                    />
                    <span className="text-xs" style={{ color: "#9a8a75" }}>
                      {items.length} {items.length === 1 ? "aula" : "aulas"}
                    </span>
                  </div>

                  {/* Cards da data */}
                  <div className="flex flex-col gap-2">
                    <AnimatePresence>
                      {items.map((lesson) => (
                        <ClassCard
                          key={lesson.id}
                          lesson={lesson}
                          onStatusChange={handleStatusChange}
                          updatingId={updatingId}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Sem resultados para o filtro ── */}
        {!loading && classes.length > 0 && groups.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <CalendarDays size={32} style={{ color: "#c4b9a8" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "#524632" }}>
              Nenhuma aula com esse status
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-3 text-xs font-medium"
              style={{ color: "#63c132" }}
            >
              Ver todas
            </button>
          </motion.div>
        )}

        {/* ── Empty state (zero aulas) ── */}
        {!loading && classes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(99, 193, 50, 0.10)" }}
            >
              <BookOpen size={36} style={{ color: "#63c132" }} />
            </div>
            <h2 className="text-lg font-bold mb-1.5" style={{ color: "#524632" }}>
              Nenhuma aula ainda
            </h2>
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "#7a6a55" }}
            >
              Cadastre sua primeira aula para começar a organizar sua agenda e acompanhar os pagamentos.
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: "#63c132" }}
            >
              <CalendarDays size={16} />
              Cadastrar primeira aula
            </motion.button>
          </motion.div>
        )}

        {/* ── Acesso rápido a Materiais ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15, ease: EASE }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "#7a6a55" }}
              >
                Materiais
              </span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "rgba(82, 70, 50, 0.10)" }}
              />
            </div>
            <button
              id="materials-shortcut-btn"
              type="button"
              onClick={() => router.push("/materials")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98]"
              style={{
                backgroundColor: "#e8e5e2",
                border: "1px solid rgba(82, 70, 50, 0.10)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(0, 110, 144, 0.12)" }}
              >
                <FileText size={17} style={{ color: "#006e90" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold" style={{ color: "#524632" }}>
                  Materiais Didáticos
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#7a6a55" }}>
                  PDFs, exercícios e recursos de aula
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "#c4b9a8" }} />
            </button>
          </motion.div>
        )}

      </main>

      {/* ── Sheet de cadastro ── */}
      <ClassFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={() => {
          refetch();
          setSheetOpen(false);
        }}
      />
    </>
  );
}
