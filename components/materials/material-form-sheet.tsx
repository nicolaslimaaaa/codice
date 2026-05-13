"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCreateMaterial } from "@/hooks/use-materials";

const materialSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().optional(),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface MaterialFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function MaterialFormSheet({ open, onOpenChange, onSuccess }: MaterialFormSheetProps) {
  const { createMaterial, loading } = useCreateMaterial();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
  });

  useEffect(() => {
    if (!open) {
      reset();
      setFile(null);
      setFileError("");
    }
  }, [open, reset]);

  const onSubmit = async (data: MaterialFormData) => {
    if (!file) {
      setFileError("Selecione um arquivo para upload");
      return;
    }
    setFileError("");

    const success = await createMaterial(file, data.title, data.description);
    if (success) {
      onSuccess();
    }
  };

  const fieldClass = (hasError: boolean) =>
    [
      "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200",
      "bg-white/40 border shadow-sm backdrop-blur-sm placeholder:text-[#524632]/40",
      "focus:bg-white/60 focus:border-[#63c132] focus:ring-2 focus:ring-[#63c132]/20",
      hasError
        ? "border-red-400 ring-2 ring-red-200 bg-red-50/50"
        : "border-[#524632]/15 hover:border-[#524632]/30",
    ].join(" ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-[#f5f4f1] border-l border-[#524632]/10"
      >
        <SheetHeader className="p-6 pb-2 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 110, 144, 0.15)" }}
            >
              <FileText size={20} style={{ color: "#006e90" }} />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold" style={{ color: "#524632" }}>
                Novo Material
              </SheetTitle>
              <SheetDescription className="text-xs" style={{ color: "#7a6a55" }}>
                Faça upload de PDFs, exercícios e documentos.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          id="material-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-5"
        >
          {/* Título */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="material-title" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Título do Material <span style={{ color: "#63c132" }}>*</span>
            </label>
            <input
              id="material-title"
              type="text"
              placeholder="Ex: Apostila de Matemática"
              {...register("title")}
              className={fieldClass(!!errors.title)}
              style={{ color: "#524632" }}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-500">{errors.title.message}</p>
            )}
          </motion.div>

          {/* Descrição */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <label htmlFor="material-desc" className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Descrição
            </label>
            <textarea
              id="material-desc"
              rows={2}
              placeholder="Descreva o conteúdo do material..."
              {...register("description")}
              className={fieldClass(!!errors.description)}
              style={{ color: "#524632", resize: "none" }}
            />
          </motion.div>

          {/* Arquivo */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#524632" }}>
              Arquivo <span style={{ color: "#63c132" }}>*</span>
            </label>
            
            <div 
              className={[
                "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-colors cursor-pointer",
                file ? "border-[#63c132] bg-white/60" : "border-[#524632]/20 bg-white/30 hover:border-[#524632]/40 hover:bg-white/50"
              ].join(" ")}
            >
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                    setFileError("");
                  }
                }}
              />
              
              <UploadCloud size={32} style={{ color: file ? "#63c132" : "#c4b9a8" }} className="mb-3" />
              
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#524632] truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-[#7a6a55] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-[#524632]">Clique ou arraste um arquivo</p>
                  <p className="text-xs text-[#7a6a55] mt-1">PDFs, Imagens, Documentos</p>
                </div>
              )}
            </div>
            {fileError && (
              <p className="mt-1.5 text-xs text-red-500">{fileError}</p>
            )}
          </motion.div>
        </form>

        <div className="p-6 border-t border-[#524632]/10 bg-[#f5f4f1]">
          <button
            type="submit"
            form="material-form"
            disabled={loading}
            className={[
              "w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2",
              "transition-all duration-200 active:scale-[0.98]",
              loading ? "opacity-70 cursor-not-allowed" : "hover:brightness-105",
            ].join(" ")}
            style={{ backgroundColor: "#63c132" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Fazendo Upload...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Salvar Material
              </>
            )}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
