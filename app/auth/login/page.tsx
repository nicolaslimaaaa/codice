"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validations";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: EASE },
  }),
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError("E-mail ou senha incorretos. Tente novamente.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#dedbd8" }}>
      <motion.div
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div custom={0} variants={fadeUp} className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#63c132] flex items-center justify-center shadow-sm">
            <BookOpen size={18} className="text-white" />
          </div>
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#524632" }}
          >
            Códice
          </span>
        </motion.div>

        {/* Título */}
        <motion.div custom={1} variants={fadeUp} className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#524632" }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm" style={{ color: "#7a6a55" }}>
            Entre na sua conta para continuar
          </p>
        </motion.div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email */}
          <motion.div custom={2} variants={fadeUp}>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#524632" }}
            >
              E-mail
            </label>
            <input
              id="login-email"
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

          {/* Senha */}
          <motion.div custom={3} variants={fadeUp}>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="text-sm font-medium"
                style={{ color: "#524632" }}
              >
                Senha
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs hover:underline transition-colors"
                style={{ color: "#006e90" }}
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className={[
                  "w-full px-4 py-3.5 pr-11 rounded-xl text-sm outline-none transition-all duration-200",
                  "bg-white/40 border shadow-sm backdrop-blur-sm placeholder:text-[#524632]/40",
                  "focus:bg-white/60 focus:border-[#63c132] focus:ring-2 focus:ring-[#63c132]/20",
                  errors.password
                    ? "border-red-400 ring-2 ring-red-200 bg-red-50/50"
                    : "border-[#524632]/15 hover:border-[#524632]/30",
                ].join(" ")}
                style={{ color: "#524632" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                style={{ color: "#524632" }}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Erro do servidor */}
          {serverError && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
            >
              {serverError}
            </motion.p>
          )}

          {/* Botão submit */}
          <motion.div custom={4} variants={fadeUp}>
            <button
              id="login-submit"
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
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </motion.div>
        </form>

        {/* Link para registro */}
        <motion.p
          custom={5}
          variants={fadeUp}
          className="mt-6 text-center text-sm"
          style={{ color: "#7a6a55" }}
        >
          Não tem uma conta?{" "}
          <Link
            href="/auth/register"
            className="font-semibold hover:underline"
            style={{ color: "#006e90" }}
          >
            Criar conta
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}
