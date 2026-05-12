"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CalendarDays, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateClass } from "@/hooks/use-classes";
import { useStudents } from "@/hooks/use-students";

// Schema de validação
const classSchema = z
  .object({
    student_id: z.string().min(1, "Selecione um aluno"),
    date: z.string().min(1, "Informe a data"),
    start_time: z.string().min(1, "Informe o horário de início"),
    end_time: z.string().min(1, "Informe o horário de fim"),
    price: z.number().min(0, "Valor inválido"),
  })
  .refine((d) => d.start_time < d.end_time, {
    message: "O horário de fim deve ser após o início",
    path: ["end_time"],
  });

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: EASE },
  }),
};

/**
 * Sheet para cadastrar uma nova aula.
 * Segue o mesmo padrão visual do StudentFormSheet.
 */
export function ClassFormSheet({ open, onOpenChange, onSuccess }: ClassFormSheetProps) {
  const { createClass, loading } = useCreateClass();
  const { students } = useStudents();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      price: 0,
    },
  });

  useEffect(() => {
    if (!open) reset({
      date: new Date().toISOString().split("T")[0],
      price: 0,
    });
  }, [open, reset]);

  async function onSubmit(data: ClassFormData) {
    const result = await createClass(data);
    if (result) {
      reset();
      onOpenChange(false);
      onSuccess?.();
    }
  }

  const fieldClass = (hasError: boolean) =>
    [
      "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200",
      "bg-white/40 border shadow-sm backdrop-blur-sm placeholder:text-[#524632]/40",
      "focus:bg-white/60 focus:border-[#63c132] focus:ring-2 focus:ring-[#63c132]/20",
      hasError ? "border-red-400 ring-2 ring-red-200 bg-red-50/50" : "border-[#524632]/15 hover:border-[#524632]/30",
    ].join(" ");

  // Data de hoje já definida em defaultValues

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(99, 193, 50, 0.15)" }}
            >
              <CalendarDays size={18} style={{ color: "#63c132" }} />
            </div>
            <div>
              <SheetTitle className="text-base font-bold" style={{ color: "#524632" }}>
                Nova Aula
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5" style={{ color: "#7a6a55" }}>
                Preencha os dados da aula abaixo
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Formulário com scroll interno */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 overflow-y-auto px-4 pb-6 space-y-5"
        >
          {/* Aluno */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="class-student" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Aluno <span style={{ color: "#63c132" }}>*</span>
            </label>
            <Controller
              control={control}
              name="student_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={fieldClass(!!errors.student_id)}
                    style={{ color: field.value ? "#524632" : "rgba(82, 70, 50, 0.4)" }}
                  >
                    <SelectValue placeholder="Selecione um aluno…" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={8} className="bg-white/80 backdrop-blur-md border-[#524632]/10 shadow-lg rounded-xl">
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}{s.grade ? ` — ${s.grade}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.student_id && (
              <p className="mt-1.5 text-xs text-red-500">{errors.student_id.message}</p>
            )}
          </motion.div>

          {/* Data */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="class-date" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Data <span style={{ color: "#63c132" }}>*</span>
            </label>
            <input
              id="class-date"
              type="date"
              {...register("date")}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className={fieldClass(!!errors.date)}
              style={{ color: "#524632" }}
            />
            {errors.date && (
              <p className="mt-1.5 text-xs text-red-500">{errors.date.message}</p>
            )}
          </motion.div>

          {/* Horários */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="class-start" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
                  Início <span style={{ color: "#63c132" }}>*</span>
                </label>
                <input
                  id="class-start"
                  type="time"
                  {...register("start_time")}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={fieldClass(!!errors.start_time)}
                />
                {errors.start_time && (
                  <p className="mt-1 text-xs text-red-500">{errors.start_time.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="class-end" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
                  Fim <span style={{ color: "#63c132" }}>*</span>
                </label>
                <input
                  id="class-end"
                  type="time"
                  {...register("end_time")}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={fieldClass(!!errors.end_time)}
                />
                {errors.end_time && (
                  <p className="mt-1 text-xs text-red-500">{errors.end_time.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Valor */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="class-price" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Valor (R$)
            </label>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
                style={{ color: "#7a6a55" }}
              >
                R$
              </span>
              <input
                id="class-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                {...register("price", { valueAsNumber: true })}
                className={[fieldClass(!!errors.price), "pl-9"].join(" ")}
                style={{ backgroundColor: "#dedbd8", color: "#524632" }}
              />
            </div>
            {errors.price && (
              <p className="mt-1.5 text-xs text-red-500">{errors.price.message}</p>
            )}
          </motion.div>

          {/* Botão submit */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="pt-2">
            <button
              id="class-form-submit"
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
                  <CalendarDays size={16} />
                  Cadastrar Aula
                </>
              )}
            </button>
          </motion.div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
