"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Search, Users, X } from "lucide-react";
import { useStudents, useDeleteStudent } from "@/hooks/use-students";
import type { Student } from "@/hooks/use-students";
import { StudentCard } from "@/components/students/student-card";
import { StudentFormSheet } from "@/components/students/student-form-sheet";
import { StudentDetailSheet } from "@/components/students/student-detail-sheet";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function StudentsPage() {
  const { students, loading, refetch } = useStudents();
  const { deleteStudent, loading: deleting } = useDeleteStudent();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filtra alunos pelo campo de busca (nome, escola ou série)
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.school?.toLowerCase().includes(q) ||
        s.grade?.toLowerCase().includes(q)
    );
  }, [students, search]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const ok = await deleteStudent(id);
    if (ok) refetch();
    setDeletingId(null);
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
              Alunos
            </h1>
            {!loading && (
              <p className="text-sm mt-0.5" style={{ color: "#7a6a55" }}>
                {students.length === 0
                  ? "Nenhum aluno cadastrado"
                  : `${students.length} aluno${students.length !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>

          {/* Botão adicionar */}
          <motion.button
            id="add-student-btn"
            whileTap={{ scale: 0.94 }}
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors"
            style={{ backgroundColor: "#63c132" }}
            aria-label="Adicionar aluno"
          >
            <UserPlus size={16} />
            <span>Novo</span>
          </motion.button>
        </motion.div>

        {/* ── Busca ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
          className="relative mb-5"
        >
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#9a8a75" }}
          />
          <input
            id="students-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, escola ou série…"
            className="w-full pl-9 pr-9 py-3 rounded-xl text-sm outline-none transition-all duration-200"
            style={{
              backgroundColor: "#e8e5e2",
              border: "1px solid rgba(82, 70, 50, 0.12)",
              color: "#524632",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md"
              aria-label="Limpar busca"
            >
              <X size={14} style={{ color: "#9a8a75" }} />
            </button>
          )}
        </motion.div>

        {/* ── Estado de carregamento ── */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[68px] rounded-2xl animate-pulse"
                style={{ backgroundColor: "rgba(82, 70, 50, 0.07)" }}
              />
            ))}
          </div>
        )}

        {/* ── Lista de alunos ── */}
        {!loading && filtered.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="flex flex-col gap-2.5"
          >
            <AnimatePresence>
              {filtered.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onDelete={handleDelete}
                  deleting={deletingId === student.id && deleting}
                  onClick={() => {
                    setSelectedStudent(student);
                    setDetailOpen(true);
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Resultado de busca vazio ── */}
        {!loading && students.length > 0 && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Search size={32} style={{ color: "#c4b9a8" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "#524632" }}>
              Nenhum resultado para "{search}"
            </p>
            <p className="text-xs mt-1" style={{ color: "#7a6a55" }}>
              Tente buscar por outro nome ou escola
            </p>
          </motion.div>
        )}

        {/* ── Empty state (sem nenhum aluno) ── */}
        {!loading && students.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            {/* Ícone */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(99, 193, 50, 0.10)" }}
            >
              <Users size={36} style={{ color: "#63c132" }} />
            </div>

            <h2 className="text-lg font-bold mb-1.5" style={{ color: "#524632" }}>
              Nenhum aluno ainda
            </h2>
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "#7a6a55" }}
            >
              Comece cadastrando seus primeiros alunos para organizar suas aulas e acompanhar o progresso.
            </p>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: "#63c132" }}
            >
              <UserPlus size={16} />
              Cadastrar primeiro aluno
            </motion.button>
          </motion.div>
        )}

      </main>

      {/* ── Sheet de cadastro ── */}
      <StudentFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={() => {
          refetch();
          setSheetOpen(false);
        }}
      />

      {/* ── Sheet de detalhe ── */}
      <StudentDetailSheet
        student={selectedStudent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDelete={handleDelete}
        deleting={!!(selectedStudent && deletingId === selectedStudent.id && deleting)}
      />
    </>
  );
}
