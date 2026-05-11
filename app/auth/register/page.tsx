"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { AvatarUpload } from "@/components/auth/avatar-upload";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: EASE },
  }),
};

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    const supabase = createClient();

    // 1. Criar conta
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    });

    if (signUpError) {
      setServerError(
        signUpError.message.includes("already registered")
          ? "Este e-mail já está cadastrado."
          : "Erro ao criar conta. Tente novamente."
      );
      return;
    }

    // 2. Upload do avatar (opcional)
    if (avatarFile && authData.user) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${authData.user.id}/avatar.${ext}`;

      const { data: uploadData } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadData.path);

        await supabase
          .from("profiles")
          .update({ avatar_url: urlData.publicUrl })
          .eq("id", authData.user.id);
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputClass = (hasError: boolean) =>
    [
      "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200",
      "bg-[#e8e5e2] border placeholder:text-[#524632]/40",
      "focus:border-[#63c132] focus:ring-2 focus:ring-[#63c132]/20",
      hasError ? "border-red-400 ring-2 ring-red-200" : "border-[#524632]/15",
    ].join(" ");

  return (
    <main className="min-h-screen flex items-center justify-center p-4 py-12" style={{ backgroundColor: "#dedbd8" }}>
      <motion.div initial="hidden" animate="visible" className="w-full max-w-sm">
        {/* Logo */}
        <motion.div custom={0} variants={fadeUp} className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#63c132] flex items-center justify-center shadow-sm">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ color: "#524632" }}>
            Códice
          </span>
        </motion.div>

        {/* Título */}
        <motion.div custom={1} variants={fadeUp} className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#524632" }}>
            Criar conta
          </h1>
          <p className="text-sm" style={{ color: "#7a6a55" }}>
            Comece a organizar sua vida acadêmica
          </p>
        </motion.div>

        {/* Avatar Upload */}
        <motion.div custom={2} variants={fadeUp} className="mb-6">
          <AvatarUpload onFileSelect={(f) => setAvatarFile(f)} />
        </motion.div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Nome */}
          <motion.div custom={3} variants={fadeUp}>
            <label htmlFor="register-name" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Nome
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Como você se chama?"
              {...register("name")}
              className={inputClass(!!errors.name)}
              style={{ color: "#524632" }}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div custom={4} variants={fadeUp}>
            <label htmlFor="register-email" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              E-mail
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              {...register("email")}
              className={inputClass(!!errors.email)}
              style={{ color: "#524632" }}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </motion.div>

          {/* Senha */}
          <motion.div custom={5} variants={fadeUp}>
            <label htmlFor="register-password" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Senha
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                {...register("password")}
                className={inputClass(!!errors.password)}
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

          {/* Confirmar Senha */}
          <motion.div custom={6} variants={fadeUp}>
            <label htmlFor="register-confirm" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="register-confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repita a senha"
                {...register("confirmPassword")}
                className={inputClass(!!errors.confirmPassword)}
                style={{ color: "#524632" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                style={{ color: "#524632" }}
                aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </motion.div>

          {/* Erro servidor */}
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
          <motion.div custom={7} variants={fadeUp}>
            <button
              id="register-submit"
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
                  Criando conta…
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </motion.div>
        </form>

        {/* Link para login */}
        <motion.p
          custom={8}
          variants={fadeUp}
          className="mt-6 text-center text-sm"
          style={{ color: "#7a6a55" }}
        >
          Já tem uma conta?{" "}
          <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "#006e90" }}>
            Entrar
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}
