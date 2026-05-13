"use client";

import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, File, Trash2, ExternalLink, Users } from "lucide-react";
import { Material, useDeleteMaterial } from "@/hooks/use-materials";
import { createBrowserClient } from "@supabase/ssr";

interface MaterialCardProps {
  material: Material;
  onDelete?: () => void;
  onShare?: () => void;
}

export function MaterialCard({ material, onDelete, onShare }: MaterialCardProps) {
  const { deleteMaterial, loading: isDeleting } = useDeleteMaterial();

  const getIcon = () => {
    if (!material.file_type) return <File size={24} style={{ color: "#006e90" }} />;
    if (material.file_type.includes("pdf")) return <FileText size={24} style={{ color: "#f18f01" }} />;
    if (material.file_type.includes("image")) return <ImageIcon size={24} style={{ color: "#63c132" }} />;
    return <File size={24} style={{ color: "#006e90" }} />;
  };

  const getBgColor = () => {
    if (!material.file_type) return "rgba(0, 110, 144, 0.1)";
    if (material.file_type.includes("pdf")) return "rgba(241, 143, 1, 0.1)";
    if (material.file_type.includes("image")) return "rgba(99, 193, 50, 0.1)";
    return "rgba(0, 110, 144, 0.1)";
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleOpen = () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = supabase.storage
      .from("materials")
      .getPublicUrl(material.file_path);

    if (data?.publicUrl) {
      window.open(data.publicUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este material?")) return;
    const success = await deleteMaterial(material.id, material.file_path);
    if (success && onDelete) {
      onDelete();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="p-4 rounded-2xl border transition-all duration-300 relative group flex items-start gap-4"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(4px)",
        borderColor: "rgba(82, 70, 50, 0.1)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: getBgColor() }}
      >
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold truncate" style={{ color: "#524632" }}>
          {material.title}
        </h3>
        {material.description && (
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#7a6a55" }}>
            {material.description}
          </p>
        )}
        <div className="flex gap-3 mt-2 text-[10px] uppercase font-semibold" style={{ color: "#c4b9a8" }}>
          <span>{new Date(material.created_at).toLocaleDateString("pt-BR")}</span>
          {material.file_size && (
            <>
              <span>•</span>
              <span>{formatSize(material.file_size)}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        <button
          type="button"
          onClick={onShare}
          className="p-2 rounded-lg hover:bg-[#63c132]/10 transition-colors"
          style={{ color: "#63c132" }}
          aria-label="Vincular a Alunos"
        >
          <Users size={18} />
        </button>
        <button
          type="button"
          onClick={handleOpen}
          className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "#524632" }}
          aria-label="Abrir material"
        >
          <ExternalLink size={18} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
          style={{ color: "#ef4444" }}
          aria-label="Excluir material"
        >
          {isDeleting ? <span className="animate-spin text-xs">...</span> : <Trash2 size={18} />}
        </button>
      </div>
    </motion.div>
  );
}
