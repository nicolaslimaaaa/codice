"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type ClassStatus = "scheduled" | "completed" | "paid";

export interface ClassWithStudent {
  id: string;
  student_id: string | null;
  user_id: string;
  date: string;          // "YYYY-MM-DD"
  start_time: string;    // "HH:MM:SS"
  end_time: string;      // "HH:MM:SS"
  price: number;
  status: ClassStatus;
  created_at: string;
  students: {
    id: string;
    name: string;
    grade: string | null;
  } | null;
}

export interface CreateClassData {
  student_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
}

// ─── useClasses ───────────────────────────────────────────────────────────────

/**
 * Lista todas as aulas do professor autenticado, com join em students.
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
      .select("*, students(id, name, grade)")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setClasses((data as ClassWithStudent[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, error, refetch: fetchClasses };
}

// ─── useCreateClass ───────────────────────────────────────────────────────────

/**
 * Hook para criar uma nova aula.
 */
export function useCreateClass() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createClass(data: CreateClassData): Promise<ClassWithStudent | null> {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Usuário não autenticado.");
      setLoading(false);
      return null;
    }

    const { data: created, error: insertError } = await supabase
      .from("classes")
      .insert({ ...data, user_id: user.id, status: "scheduled" })
      .select("*, students(id, name, grade)")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return created as ClassWithStudent;
  }

  return { createClass, loading, error };
}

// ─── useUpdateClassStatus ─────────────────────────────────────────────────────

const STATUS_CYCLE: ClassStatus[] = ["scheduled", "completed", "paid"];

/**
 * Avança o status de uma aula no ciclo: scheduled → completed → paid → scheduled.
 */
export function useUpdateClassStatus() {
  const [loading, setLoading] = useState(false);

  async function cycleStatus(
    classId: string,
    currentStatus: ClassStatus
  ): Promise<ClassStatus | null> {
    setLoading(true);

    const nextIndex = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIndex];

    const supabase = createClient();
    const { error } = await supabase
      .from("classes")
      .update({ status: nextStatus })
      .eq("id", classId);

    setLoading(false);
    if (error) return null;
    return nextStatus;
  }

  return { cycleStatus, loading };
}

// ─── useDeleteClass ───────────────────────────────────────────────────────────

export function useDeleteClass() {
  const [loading, setLoading] = useState(false);

  async function deleteClass(classId: string): Promise<boolean> {
    setLoading(true);
    
    const supabase = createClient();
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);

    setLoading(false);
    
    if (error) {
      console.error("Erro ao deletar aula:", error);
      return false;
    }
    
    return true;
  }

  return { deleteClass, loading };
}

