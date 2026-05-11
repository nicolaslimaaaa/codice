"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentFormData } from "@/lib/validations";

export interface Student {
  id: string;
  name: string;
  grade: string | null;
  school: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

/**
 * Hook para listar alunos do usuário autenticado.
 */
export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setStudents(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
}

/**
 * Hook para criar um novo aluno.
 */
export function useCreateStudent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStudent = useCallback(async (data: StudentFormData) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Usuário não autenticado.");
      setLoading(false);
      return null;
    }

    const { data: student, error: insertError } = await supabase
      .from("students")
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return student as Student;
  }, []);

  return { createStudent, loading, error };
}
