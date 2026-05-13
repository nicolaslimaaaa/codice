"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, Search, Check } from "lucide-react";
import { Material, useMaterialLinks } from "@/hooks/use-materials";
import { useStudents } from "@/hooks/use-students";
import { createBrowserClient } from "@supabase/ssr";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface MaterialStudentsSheetProps {
  material: Material | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialStudentsSheet({ material, open, onOpenChange }: MaterialStudentsSheetProps) {
  const { students, loading: loadingStudents } = useStudents();
  const { linkToStudent, unlinkFromStudent } = useMaterialLinks();
  
  const [linkedStudentIds, setLinkedStudentIds] = useState<string[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open && material) {
      fetchLinks();
    } else {
      setSearch("");
    }
  }, [open, material]);

  const fetchLinks = async () => {
    if (!material) return;
    setLoadingLinks(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("student_materials")
      .select("student_id")
      .eq("material_id", material.id);

    if (!error && data) {
      setLinkedStudentIds(data.map(d => d.student_id));
    }
    setLoadingLinks(false);
  };

  const handleToggleLink = async (studentId: string, isLinked: boolean) => {
    if (!material) return;
    setProcessingId(studentId);
    
    let success = false;
    if (isLinked) {
      success = await unlinkFromStudent(material.id, studentId);
      if (success) {
        setLinkedStudentIds(prev => prev.filter(id => id !== studentId));
      }
    } else {
      success = await linkToStudent(material.id, studentId);
      if (success) {
        setLinkedStudentIds(prev => [...prev, studentId]);
      }
    }
    
    setProcessingId(null);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!material) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-[#f5f4f1] border-l border-[#524632]/10"
      >
        <SheetHeader className="p-6 pb-4 text-left border-b border-[#524632]/10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(99, 193, 50, 0.15)" }}
            >
              <Users size={20} style={{ color: "#63c132" }} />
            </div>
            <div className="min-w-0 pr-4">
              <SheetTitle className="text-base font-bold truncate" style={{ color: "#524632" }}>
                Compartilhar Material
              </SheetTitle>
              <SheetDescription className="text-xs truncate" style={{ color: "#7a6a55" }}>
                {material.title}
              </SheetDescription>
            </div>
          </div>
          
          <div className="relative mt-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#9a8a75" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar aluno..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-white/40 border border-[#524632]/15 shadow-sm backdrop-blur-sm focus:bg-white/60 focus:border-[#63c132]"
              style={{ color: "#524632" }}
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingStudents || loadingLinks ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#9a8a75]" size={24} />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-medium" style={{ color: "#524632" }}>Nenhum aluno cadastrado</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredStudents.map((student) => {
                const isLinked = linkedStudentIds.includes(student.id);
                const isProcessing = processingId === student.id;

                // Iniciais para o avatar
                const initials = student.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

                return (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl flex items-center justify-between gap-3 bg-white/40 border transition-all"
                    style={{ 
                      borderColor: isLinked ? "#63c132" : "rgba(82, 70, 50, 0.1)",
                      backgroundColor: isLinked ? "rgba(99, 193, 50, 0.05)" : "rgba(255, 255, 255, 0.4)"
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold bg-[#dedad7] text-[#524632]">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate" style={{ color: "#524632" }}>
                          {student.name}
                        </h4>
                        <p className="text-[10px] uppercase font-semibold" style={{ color: "#9a8a75" }}>
                          {student.grade || "Sem série"}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleLink(student.id, isLinked)}
                      disabled={isProcessing}
                      className={[
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
                        isLinked ? "bg-[#63c132] text-white" : "bg-white border border-[#524632]/20 text-[#c4b9a8] hover:border-[#63c132] hover:text-[#63c132]"
                      ].join(" ")}
                    >
                      {isProcessing ? (
                        <Loader2 size={14} className="animate-spin text-current" />
                      ) : isLinked ? (
                        <Check size={16} />
                      ) : (
                        <div className="w-3 h-3 rounded-sm border-2 border-current" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
