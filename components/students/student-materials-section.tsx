"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, File, FileText, Image as ImageIcon, ExternalLink, Unlink, Plus, Loader2 } from "lucide-react";
import { useMaterials, useStudentMaterials, useMaterialLinks, Material } from "@/hooks/use-materials";
import { createBrowserClient } from "@supabase/ssr";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface StudentMaterialsSectionProps {
  studentId: string;
}

export function StudentMaterialsSection({ studentId }: StudentMaterialsSectionProps) {
  const { materials: linkedMaterials, loading, refetch } = useStudentMaterials(studentId);
  const { unlinkFromStudent, loading: unlinking } = useMaterialLinks();
  const [assignOpen, setAssignOpen] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getIcon = (type?: string | null) => {
    if (!type) return <File size={16} style={{ color: "#006e90" }} />;
    if (type.includes("pdf")) return <FileText size={16} style={{ color: "#f18f01" }} />;
    if (type.includes("image")) return <ImageIcon size={16} style={{ color: "#63c132" }} />;
    return <File size={16} style={{ color: "#006e90" }} />;
  };

  const getBgColor = (type?: string | null) => {
    if (!type) return "rgba(0, 110, 144, 0.1)";
    if (type.includes("pdf")) return "rgba(241, 143, 1, 0.1)";
    if (type.includes("image")) return "rgba(99, 193, 50, 0.1)";
    return "rgba(0, 110, 144, 0.1)";
  };

  const handleOpen = (material: Material) => {
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

  const handleUnlink = async (materialId: string) => {
    if (!confirm("Remover este material do aluno?")) return;
    setUnlinkingId(materialId);
    const success = await unlinkFromStudent(materialId, studentId);
    if (success) refetch();
    setUnlinkingId(null);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "#524632" }}>
          <BookOpen size={16} style={{ color: "#9a8a75" }} />
          Materiais Vinculados
        </h3>
        <button
          onClick={() => setAssignOpen(true)}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors hover:brightness-105"
          style={{ backgroundColor: "#63c132", color: "white" }}
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={24} className="animate-spin text-[#9a8a75]" />
        </div>
      ) : linkedMaterials.length === 0 ? (
        <div 
          className="rounded-2xl p-6 text-center border border-dashed"
          style={{ borderColor: "rgba(82, 70, 50, 0.2)", backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        >
          <p className="text-xs" style={{ color: "#7a6a55" }}>
            Nenhum material vinculado a este aluno.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {linkedMaterials.map((material) => (
              <motion.div
                key={material.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 rounded-xl flex items-center gap-3 transition-colors group"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  border: "1px solid rgba(82, 70, 50, 0.1)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: getBgColor(material.file_type) }}
                >
                  {getIcon(material.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate" style={{ color: "#524632" }}>
                    {material.title}
                  </h4>
                  <div className="flex gap-2 mt-0.5 text-[10px] uppercase font-semibold" style={{ color: "#c4b9a8" }}>
                    <span>{new Date(material.created_at).toLocaleDateString("pt-BR")}</span>
                    {material.file_size && (
                      <>
                        <span>•</span>
                        <span>{formatSize(material.file_size)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpen(material)}
                    className="p-1.5 rounded-lg hover:bg-black/5"
                    style={{ color: "#524632" }}
                    aria-label="Abrir"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    onClick={() => handleUnlink(material.id)}
                    disabled={unlinkingId === material.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    style={{ color: "#ef4444" }}
                    aria-label="Desvincular"
                  >
                    {unlinkingId === material.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Unlink size={16} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Sheet para adicionar materiais (Opção B) */}
      <AssignMaterialToStudentSheet 
        studentId={studentId} 
        open={assignOpen} 
        onOpenChange={setAssignOpen}
        onAssigned={() => refetch()}
        alreadyLinkedIds={linkedMaterials.map(m => m.id)}
      />
    </div>
  );
}

// ─── SHEET DE ASSINATURA (OPÇÃO B) ───

function AssignMaterialToStudentSheet({ 
  studentId, 
  open, 
  onOpenChange, 
  onAssigned,
  alreadyLinkedIds
}: { 
  studentId: string; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
  alreadyLinkedIds: string[];
}) {
  const { materials, loading } = useMaterials();
  const { linkToStudent } = useMaterialLinks();
  const [linkingId, setLinkingId] = useState<string | null>(null);

  // Filtra apenas os que ainda NÃO estão vinculados
  const availableMaterials = materials.filter(m => !alreadyLinkedIds.includes(m.id));

  const handleLink = async (materialId: string) => {
    setLinkingId(materialId);
    const success = await linkToStudent(materialId, studentId);
    if (success) {
      onAssigned();
    }
    setLinkingId(null);
  };

  const getIcon = (type?: string | null) => {
    if (!type) return <File size={16} style={{ color: "#006e90" }} />;
    if (type.includes("pdf")) return <FileText size={16} style={{ color: "#f18f01" }} />;
    if (type.includes("image")) return <ImageIcon size={16} style={{ color: "#63c132" }} />;
    return <File size={16} style={{ color: "#006e90" }} />;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-[#f5f4f1] border-l border-[#524632]/10 z-[100]"
      >
        <SheetHeader className="p-6 pb-2 text-left">
          <SheetTitle className="text-lg font-bold" style={{ color: "#524632" }}>
            Vincular Material
          </SheetTitle>
          <SheetDescription className="text-xs" style={{ color: "#7a6a55" }}>
            Selecione um material da sua biblioteca para este aluno.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#9a8a75]" size={24} />
            </div>
          ) : availableMaterials.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-medium" style={{ color: "#524632" }}>Nenhum material disponível</p>
              <p className="text-xs mt-1" style={{ color: "#7a6a55" }}>Todos os materiais já estão vinculados ou a biblioteca está vazia.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {availableMaterials.map((material) => (
                <div
                  key={material.id}
                  className="p-3 rounded-xl flex items-center justify-between gap-3 bg-white/40 border"
                  style={{ borderColor: "rgba(82, 70, 50, 0.1)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(82, 70, 50, 0.05)" }}>
                      {getIcon(material.file_type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate" style={{ color: "#524632" }}>
                        {material.title}
                      </h4>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleLink(material.id)}
                    disabled={linkingId === material.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors flex gap-1 items-center"
                    style={{ backgroundColor: "#63c132" }}
                  >
                    {linkingId === material.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Vincular"
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
