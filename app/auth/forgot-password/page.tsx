"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: EASE },
  }),
};

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setServerError("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    setSent(true);
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#dedbd8" }}
    >
      <motion.div initial="hidden" animate="visible" className="w-full max-w-sm">
        {/* Logo */}
        <motion.div custom={0} variants={fadeUp} className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#63c132] flex items-center justify-center shadow-sm">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ color: "#524632" }}>
            Códice
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          {!sent ? (
            /* ── Formulário ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <motion.div custom={1} variants={fadeUp} className="mb-8">
                <h1 className="text-3xl font-bold mb-1" style={{ color: "#524632" }}>
                  Recuperar senha
                </h1>
                <p className="text-sm" style={{ color: "#7a6a55" }}>
                  Enviaremos um link de redefinição para o seu e-mail.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <motion.div custom={2} variants={fadeUp}>
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "#524632" }}
                  >
                    E-mail
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    className={[
                      "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200",
                      "bg-white/40 border shadow-sm backdrop-blur-sm placeholder:text-[#524632]/40",
                      "focus:bg-white/60 focus:border-[#63c132] focus:ring-2 focus:ring-[#63c132]/20",
                      errors.email
                        ? "border-red-400 ring-2 ring-red-200 bg-red-50/50"
                        : "border-[#524632]/15 hover:border-[#524632]/30",
                    ].join(" ")}
                    style={{ color: "#524632" }}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </motion.div>

                {serverError && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                  >
                    {serverError}
                  </motion.p>
                )}

                <motion.div custom={3} variants={fadeUp}>
                  <button
                    id="forgot-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className={[
                      "w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200",
                      "bg-[#63c132] hover:bg-[#57ad2b] active:scale-[0.98] shadow-sm",
                      "flex items-center justify-center gap-2 mt-2",
                      isSubmitting ? "opacity-70 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </button>
                </motion.div>
              </form>

              <motion.div custom={4} variants={fadeUp} className="mt-6">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 text-sm hover:underline transition-colors w-fit"
                  style={{ color: "#006e90" }}
                >
                  <ArrowLeft size={14} />
                  Voltar para o login
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            /* ── Feedback de sucesso ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-[#63c132]/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-[#63c132]" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#524632" }}>
                E-mail enviado!
              </h2>
              <p className="text-sm mb-6" style={{ color: "#7a6a55" }}>
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: "#006e90" }}
              >
                <ArrowLeft size={14} />
                Voltar para o login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
