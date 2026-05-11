"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ClassFormData } from "@/lib/validations";

export interface ClassWithStudent {
  id: string;
  student_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: "scheduled" | "completed" | "paid";
  created_at: string;
  students: {
    id: string;
    name: string;
    grade: string | null;
  } | null;
}

/**
 * Hook para listar aulas com dados do aluno relacionado.
 */
export function useClasses() {
  const [classes, setClasses] = useState<ClassWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("classes")
      .select(`
        *,
        students (id, name, grade)
      `)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setClasses((data ?? []) as ClassWithStudent[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, error, refetch: fetchClasses };
}

/**
 * Hook para criar uma nova aula.
 */
export function useCreateClass() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClass = useCallback(async (data: ClassFormData) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Usuário não autenticado.");
      setLoading(false);
      return null;
    }

    const { data: classData, error: insertError } = await supabase
      .from("classes")
      .insert({ ...data, user_id: user.id })
      .select(`*, students(id, name, grade)`)
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return classData as ClassWithStudent;
  }, []);

  return { createClass, loading, error };
}
