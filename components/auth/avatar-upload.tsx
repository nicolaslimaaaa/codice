"use client";

import { useRef, useState } from "react";
import { Camera, User } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  onFileSelect: (file: File) => void;
  previewUrl?: string | null;
}

/**
 * Componente reutilizável de upload de avatar.
 * Exibe placeholder quando vazio e preview circular da imagem selecionada.
 */
export function AvatarUpload({ onFileSelect, previewUrl }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileChange(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return; // max 2MB

    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={[
          "relative w-24 h-24 rounded-full border-2 border-dashed transition-all duration-200 overflow-hidden",
          "flex items-center justify-center group",
          isDragging
            ? "border-[#63c132] bg-[#63c132]/10 scale-105"
            : "border-[#524632]/30 bg-[#dedbd8] hover:border-[#63c132] hover:bg-[#63c132]/5",
        ].join(" ")}
        aria-label="Selecionar foto de perfil"
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview do avatar"
              fill
              className="object-cover"
            />
            {/* Overlay no hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-[#524632]/50">
            <User size={28} />
            <Camera size={14} className="group-hover:text-[#63c132] transition-colors" />
          </div>
        )}
      </button>

      <p className="text-xs text-[#524632]/60 text-center">
        Clique ou arraste para adicionar foto
        <br />
        <span className="text-[#524632]/40">JPG, PNG ou WebP · Máx. 2MB</span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onInputChange}
        aria-hidden="true"
      />
    </div>
  );
}
