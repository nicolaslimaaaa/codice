import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Material {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = useCallback(async () => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar materiais:", error.message || error);
    } else {
      setMaterials(data as Material[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return { materials, loading, refetch: fetchMaterials };
}

export function useCreateMaterial() {
  const [loading, setLoading] = useState(false);

  const createMaterial = async (
    file: File,
    title: string,
    description?: string
  ) => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // 1. Upload to Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. Save metadata to DB
      const { error: dbError } = await supabase.from("materials").insert({
        teacher_id: user.id,
        title,
        description: description || null,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
      });

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error("Erro ao criar material:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createMaterial, loading };
}

export function useDeleteMaterial() {
  const [loading, setLoading] = useState(false);

  const deleteMaterial = async (id: string, filePath: string) => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from("materials")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Remove from DB
      const { error: dbError } = await supabase
        .from("materials")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error("Erro ao deletar material:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteMaterial, loading };
}

// ─── LÓGICA DE VÍNCULOS COM ALUNOS ───

export function useStudentMaterials(studentId: string | undefined) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudentMaterials = useCallback(async () => {
    if (!studentId) return;
    
    setLoading(true);
    const supabase = createClient();

    // Faz um join entre student_materials e materials
    const { data, error } = await supabase
      .from("student_materials")
      .select(`
        material_id,
        materials (*)
      `)
      .eq("student_id", studentId);

    if (error) {
      console.error("Erro ao buscar materiais do aluno:", error);
    } else if (data) {
      // Formata os dados para retornar um array de Material
      const mats = data.map((item: any) => item.materials as Material).filter(Boolean);
      setMaterials(mats);
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchStudentMaterials();
  }, [fetchStudentMaterials]);

  return { materials, loading, refetch: fetchStudentMaterials };
}

export function useMaterialLinks() {
  const [loading, setLoading] = useState(false);

  const linkToStudent = async (materialId: string, studentId: string) => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("student_materials")
        .insert({ material_id: materialId, student_id: studentId });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao vincular material:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unlinkFromStudent = async (materialId: string, studentId: string) => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("student_materials")
        .delete()
        .match({ material_id: materialId, student_id: studentId });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao desvincular material:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { linkToStudent, unlinkFromStudent, loading };
}
