"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, BookOpen, UploadCloud } from "lucide-react";
import { useMaterials, Material } from "@/hooks/use-materials";
import { MaterialCard } from "@/components/materials/material-card";
import { MaterialFormSheet } from "@/components/materials/material-form-sheet";
import { MaterialStudentsSheet } from "@/components/materials/material-students-sheet";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function MaterialsPage() {
  const { materials, loading, refetch } = useMaterials();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Controle para o Sheet de vinculação
  const [sharingMaterial, setSharingMaterial] = useState<Material | null>(null);

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    (m.description && m.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <main className="flex flex-col p-5 pb-28" style={{ minHeight: "100dvh" }}>
        {/* ── Cabeçalho ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center justify-between pt-4 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#524632" }}>
              Materiais
            </h1>
            {!loading && (
              <p className="text-sm mt-0.5" style={{ color: "#7a6a55" }}>
                {materials.length === 0
                  ? "Sua biblioteca está vazia"
                  : `${materials.length} arquivo${materials.length !== 1 ? "s" : ""} no total`}
              </p>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: "#63c132" }}
            aria-label="Novo material"
          >
            <Plus size={18} />
            <span>Novo</span>
          </motion.button>
        </motion.div>

        {/* ── Busca ── */}
        {!loading && materials.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-6"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} style={{ color: "#c4b9a8" }} />
            </div>
            <input
              type="text"
              placeholder="Buscar materiais..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 bg-white/40 border shadow-sm backdrop-blur-sm placeholder:text-[#524632]/40 focus:bg-white/60 focus:border-[#63c132] focus:ring-2 focus:ring-[#63c132]/20 border-[#524632]/15 hover:border-[#524632]/30"
              style={{ color: "#524632" }}
            />
          </motion.div>
        )}

        {/* ── Skeleton loading ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ backgroundColor: "rgba(82, 70, 50, 0.07)" }}
              />
            ))}
          </div>
        )}

        {/* ── Lista de Materiais ── */}
        {!loading && filteredMaterials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredMaterials.map((material) => (
                <MaterialCard 
                  key={material.id} 
                  material={material} 
                  onDelete={refetch}
                  onShare={() => setSharingMaterial(material)} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Empty state (busca vazia) ── */}
        {!loading && materials.length > 0 && filteredMaterials.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Search size={32} style={{ color: "#c4b9a8" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "#524632" }}>
              Nenhum material encontrado
            </p>
          </motion.div>
        )}

        {/* ── Empty state (zero materiais) ── */}
        {!loading && materials.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(99, 193, 50, 0.10)" }}
            >
              <BookOpen size={36} style={{ color: "#63c132" }} />
            </div>
            <h2 className="text-lg font-bold mb-1.5" style={{ color: "#524632" }}>
              Sua biblioteca está vazia
            </h2>
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "#7a6a55" }}
            >
              Faça upload de PDFs, apostilas e exercícios para compartilhar com seus alunos.
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: "#63c132" }}
            >
              <UploadCloud size={16} />
              Fazer Upload
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Formulário de Upload */}
      <MaterialFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={() => {
          refetch();
          setSheetOpen(false);
        }}
      />

      {/* Modal de Compartilhamento / Vínculo a Alunos */}
      <MaterialStudentsSheet
        material={sharingMaterial}
        open={!!sharingMaterial}
        onOpenChange={(open) => !open && setSharingMaterial(null)}
      />
    </>
  );
}
