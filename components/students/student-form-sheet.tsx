"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, UserPlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { studentSchema, type StudentFormData } from "@/lib/validations";
import { useCreateStudent } from "@/hooks/use-students";

interface StudentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const fieldClass = (hasError: boolean) =>
  [
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200",
    "bg-[#dedbd8] border placeholder:text-[#524632]/40",
    "focus:border-[#63c132] focus:ring-2 focus:ring-[#63c132]/20",
    hasError ? "border-red-400 ring-2 ring-red-200" : "border-[#524632]/15",
  ].join(" ");

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: EASE },
  }),
};

/**
 * Sheet de cadastro de aluno usando shadcn/ui Sheet,
 * React Hook Form + Zod, com transições suaves.
 */
export function StudentFormSheet({ open, onOpenChange, onSuccess }: StudentFormSheetProps) {
  const { createStudent, loading } = useCreateStudent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({ resolver: zodResolver(studentSchema) });

  // Limpa o form ao fechar
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  async function onSubmit(data: StudentFormData) {
    const student = await createStudent(data);
    if (student) {
      reset();
      onOpenChange(false);
      onSuccess?.();
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto scrollbar-thin"
        style={{ backgroundColor: "#e8e5e2", borderLeft: "1px solid rgba(82, 70, 50, 0.12)" }}
      >
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(99, 193, 50, 0.15)" }}
            >
              <UserPlus size={18} style={{ color: "#63c132" }} />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold" style={{ color: "#524632" }}>
                Novo Aluno
              </SheetTitle>
              <SheetDescription className="text-sm" style={{ color: "#7a6a55" }}>
                Preencha os dados do aluno abaixo
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Nome */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="student-name" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Nome do aluno <span style={{ color: "#63c132" }}>*</span>
            </label>
            <input
              id="student-name"
              type="text"
              placeholder="Ex: João Silva"
              {...register("name")}
              className={fieldClass(!!errors.name)}
              style={{ color: "#524632" }}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
            )}
          </motion.div>

          {/* Série / Ano */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="student-grade" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Série / Ano
            </label>
            <input
              id="student-grade"
              type="text"
              placeholder="Ex: 8º Ano, 3ª série EM…"
              {...register("grade")}
              className={fieldClass(!!errors.grade)}
              style={{ color: "#524632" }}
            />
          </motion.div>

          {/* Escola */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="student-school" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Escola
            </label>
            <input
              id="student-school"
              type="text"
              placeholder="Nome da escola"
              {...register("school")}
              className={fieldClass(!!errors.school)}
              style={{ color: "#524632" }}
            />
          </motion.div>

          {/* Endereço */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="student-address" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Endereço
            </label>
            <input
              id="student-address"
              type="text"
              placeholder="Rua, número, bairro…"
              {...register("address")}
              className={fieldClass(!!errors.address)}
              style={{ color: "#524632" }}
            />
          </motion.div>

          {/* Observações */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="student-notes" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Observações
            </label>
            <textarea
              id="student-notes"
              rows={4}
              placeholder="Dificuldades, preferências, materiais específicos…"
              {...register("notes")}
              className={[fieldClass(!!errors.notes), "resize-none"].join(" ")}
              style={{ color: "#524632" }}
            />
          </motion.div>

          {/* Botão submit */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="pt-2">
            <button
              id="student-form-submit"
              type="submit"
              disabled={loading}
              className={[
                "w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200",
                "bg-[#63c132] hover:bg-[#57ad2b] active:scale-[0.98] shadow-sm",
                "flex items-center justify-center gap-2",
                loading ? "opacity-70 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Cadastrar Aluno
                </>
              )}
            </button>
          </motion.div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
