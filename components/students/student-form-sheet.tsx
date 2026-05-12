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
 * Sheet de cadastro de aluno.
 * — SheetHeader tem p-4 (shadcn default), o form usa o mesmo px-4
 *   para alinhar inputs com o cabeçalho.
 * — O <form> cresce com flex-1 e rola internamente (overflow-y-auto),
 *   mantendo o cabeçalho fixo e o botão sempre acessível.
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

  const fieldClass = (hasError: boolean) =>
    [
      "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200",
      "border placeholder:text-[#524632]/40",
      "focus:border-[#63c132] focus:ring-2 focus:ring-[#63c132]/20",
      hasError ? "border-red-400 ring-2 ring-red-200" : "border-[#524632]/15",
    ].join(" ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/*
       * SheetContent usa data-[side=right]:w-3/4 e data-[side=right]:sm:max-w-sm
       * com alta especificidade CSS — não adianta sobrescrever com w-full.
       * O layout flex-col já está no componente; usamos flex-1/overflow-y-auto no form.
       */}
      <SheetContent
        side="right"
        style={{
          backgroundColor: "#e8e5e2",
          borderLeft: "1px solid rgba(82, 70, 50, 0.12)",
        }}
      >
        {/* Cabeçalho — SheetHeader já tem p-4 (shadcn). pr-8 protege do botão X */}
        <SheetHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center gap-3 pr-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(99, 193, 50, 0.15)" }}
            >
              <UserPlus size={18} style={{ color: "#63c132" }} />
            </div>
            <div>
              <SheetTitle
                className="text-base font-bold"
                style={{ color: "#524632" }}
              >
                Novo Aluno
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5" style={{ color: "#7a6a55" }}>
                Preencha os dados do aluno abaixo
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/*
         * Formulário cresce para ocupar o espaço restante e rola internamente.
         * px-4 alinha com o padding do SheetHeader (p-4).
         * pb-6 garante que o botão não fique colado na borda inferior.
         */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 overflow-y-auto px-4 pb-6 space-y-5"
        >
          {/* Nome */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <label
              htmlFor="student-name"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#524632" }}
            >
              Nome do aluno <span style={{ color: "#63c132" }}>*</span>
            </label>
            <input
              id="student-name"
              type="text"
              placeholder="Ex: João Silva"
              {...register("name")}
              className={fieldClass(!!errors.name)}
              style={{ backgroundColor: "#dedbd8", color: "#524632" }}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
            )}
          </motion.div>

          {/* Série / Ano */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <label
              htmlFor="student-grade"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#524632" }}
            >
              Série / Ano
            </label>
            <input
              id="student-grade"
              type="text"
              placeholder="Ex: 8º Ano, 3ª série EM…"
              {...register("grade")}
              className={fieldClass(!!errors.grade)}
              style={{ backgroundColor: "#dedbd8", color: "#524632" }}
            />
          </motion.div>

          {/* Escola */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <label
              htmlFor="student-school"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#524632" }}
            >
              Escola
            </label>
            <input
              id="student-school"
              type="text"
              placeholder="Nome da escola"
              {...register("school")}
              className={fieldClass(!!errors.school)}
              style={{ backgroundColor: "#dedbd8", color: "#524632" }}
            />
          </motion.div>

          {/* Endereço */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
            <label
              htmlFor="student-address"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#524632" }}
            >
              Endereço
            </label>
            <textarea
              id="student-address"
              rows={3}
              placeholder="Rua, número, bairro…"
              {...register("address")}
              className={[fieldClass(!!errors.address), "resize-none"].join(" ")}
              style={{ backgroundColor: "#dedbd8", color: "#524632" }}
            />
          </motion.div>

          {/* Observações */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
            <label
              htmlFor="student-notes"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#524632" }}
            >
              Observações
            </label>
            <textarea
              id="student-notes"
              rows={4}
              placeholder="Dificuldades, preferências, materiais específicos…"
              {...register("notes")}
              className={[fieldClass(!!errors.notes), "resize-none"].join(" ")}
              style={{ backgroundColor: "#dedbd8", color: "#524632" }}
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
