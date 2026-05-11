import { z } from "zod";

/* ─────────────────────────────────────────
   Auth Schemas
   ───────────────────────────────────────── */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "O nome deve ter no mínimo 2 caracteres")
      .max(80, "O nome deve ter no máximo 80 caracteres"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("Informe um e-mail válido"),
    password: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
});

/* ─────────────────────────────────────────
   Student Schema
   ───────────────────────────────────────── */

export const studentSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo"),
  grade: z.string().max(50).optional(),
  school: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

/* ─────────────────────────────────────────
   Class Schema
   ───────────────────────────────────────── */

export const classSchema = z.object({
  student_id: z.string().uuid("Aluno inválido"),
  date: z.string().min(1, "A data é obrigatória"),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  price: z
    .number()
    .min(0, "O valor não pode ser negativo"),
  status: z.enum(["scheduled", "completed", "paid"]),
});

/* ─────────────────────────────────────────
   Inferred Types
   ───────────────────────────────────────── */

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;
export type ClassFormData = z.infer<typeof classSchema>;
