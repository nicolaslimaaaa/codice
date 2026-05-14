"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClassWithStudent, ClassStatus } from "./use-classes";

export function useFinancial(month?: number, year?: number) {
  const [classes, setClasses] = useState<ClassWithStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("classes")
      .select("*, students(id, name, grade)")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    // Se passou mês e ano, filtra (1-indexed month)
    if (month !== undefined && year !== undefined) {
      // Cria a data de início e fim do mês
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      query = query.gte("date", startDate).lte("date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar dados financeiros:", error);
    } else {
      setClasses(data as ClassWithStudent[]);
    }
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  // Agregações de valores
  const totals = useMemo(() => {
    return classes.reduce(
      (acc, curr) => {
        const price = Number(curr.price) || 0;
        if (curr.status === "paid") {
          acc.paid += price;
        } else if (curr.status === "completed") {
          acc.completedUnpaid += price;
        } else if (curr.status === "scheduled") {
          acc.scheduled += price;
        }
        return acc;
      },
      { paid: 0, completedUnpaid: 0, scheduled: 0 }
    );
  }, [classes]);

  // Agrupa as aulas pendentes (completedUnpaid) por aluno para exibir na lista
  const pendingByStudent = useMemo(() => {
    const pendingClasses = classes.filter(c => c.status === "completed" || c.status === "scheduled");
    
    const grouped = pendingClasses.reduce((acc, curr) => {
      const studentId = curr.student_id || "sem-aluno";
      const studentName = curr.students?.name || "Aluno Excluído";
      
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          studentName,
          classes: [],
          totalCompleted: 0,
          totalScheduled: 0
        };
      }
      
      acc[studentId].classes.push(curr);
      
      if (curr.status === "completed") {
        acc[studentId].totalCompleted += Number(curr.price) || 0;
      } else {
        acc[studentId].totalScheduled += Number(curr.price) || 0;
      }
      
      return acc;
    }, {} as Record<string, {
      studentId: string;
      studentName: string;
      classes: ClassWithStudent[];
      totalCompleted: number;
      totalScheduled: number;
    }>);

    return Object.values(grouped).sort((a, b) => b.totalCompleted - a.totalCompleted);
  }, [classes]);

  const markAsPaid = async (classId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("classes")
        .update({ status: "paid" })
        .eq("id", classId);

      if (error) throw error;

      // Update local state for optimistic UI
      setClasses(prev => prev.map(c => 
        c.id === classId ? { ...c, status: "paid" } : c
      ));
      
      return true;
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
      return false;
    }
  };

  const updateClassStatus = async (classId: string, newStatus: ClassStatus) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("classes")
        .update({ status: newStatus })
        .eq("id", classId);

      if (error) throw error;

      // Update local state
      setClasses(prev => prev.map(c => 
        c.id === classId ? { ...c, status: newStatus } : c
      ));
      
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar status para ${newStatus}:`, error);
      return false;
    }
  };

  return {
    classes,
    totals,
    pendingByStudent,
    loading,
    refetch: fetchFinancials,
    markAsPaid,
    updateClassStatus
  };
}
