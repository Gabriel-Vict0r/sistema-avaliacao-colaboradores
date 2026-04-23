import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { employeeService, CreateEmployeeData } from "../services/employee.service";
import { evaluationService } from "../services/evaluation.service";
import { branchService, Branch } from "../services/branch.service";
import { getCriteriaByType } from "../data/criteria";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { extractApiErrorMessage } from "../lib/error-handler";

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  type: "gestores" | "operacionais";
  managerId?: string;
  branchId?: string;
  branchName?: string;
  seniorId?: string;
  avaliador01?: string;
  avaliador02?: string;
  avaliador03?: string;
  avaliador04?: string;
  avaliador05?: string;
  avaliador06?: string;
  avaliador07?: string;
  avaliador08?: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluatorUsername: string;
  type: "gestores" | "operacionais";
  ratings: Record<string, string>;
  average: number;
  decision: "manter" | "desligar" | "em_avaliacao";
  justification: string;
  date: string;
}

interface AppContextType {
  employees: Employee[];
  evaluations: Evaluation[];
  branches: Branch[];
  isLoading: boolean;
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  addEvaluation: (evaluation: Omit<Evaluation, "id" | "date">) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  getEvaluationsByEmployee: (employeeId: string) => Evaluation[];
  getPendingEmployees: (type?: string) => Employee[];
  refreshEmployees: () => Promise<void>;
  refreshEvaluations: () => Promise<void>;
  refreshBranches: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapEmployee(e: any): Employee {
  return {
    id: String(e.id),
    name: e.name,
    position: e.position,
    department: e.department,
    type: (e.type as string).toLowerCase() as "gestores" | "operacionais",
    managerId: e.managerId != null ? String(e.managerId) : undefined,
    branchId: e.branchId != null ? String(e.branchId) : undefined,
    branchName: e.branch?.name ?? undefined,
    seniorId: e.seniorId ?? undefined,
    avaliador01: e.avaliador01 ?? undefined,
    avaliador02: e.avaliador02 ?? undefined,
    avaliador03: e.avaliador03 ?? undefined,
    avaliador04: e.avaliador04 ?? undefined,
    avaliador05: e.avaliador05 ?? undefined,
    avaliador06: e.avaliador06 ?? undefined,
    avaliador07: e.avaliador07 ?? undefined,
    avaliador08: e.avaliador08 ?? undefined,
  };
}

function mapDecisionFromApi(decision: string): "manter" | "desligar" | "em_avaliacao" {
  if (decision === "EM_EVOLUCAO") return "em_avaliacao";
  return decision.toLowerCase() as "manter" | "desligar";
}

function mapDecisionToApi(decision: string): "MANTER" | "DESLIGAR" | "EM_EVOLUCAO" {
  if (decision === "em_avaliacao") return "EM_EVOLUCAO";
  return decision.toUpperCase() as "MANTER" | "DESLIGAR";
}

function mapEvaluation(e: any): Evaluation {
  const ratingsRecord: Record<string, string> = {};
  if (Array.isArray(e.ratings)) {
    e.ratings.forEach((r: any) => {
      ratingsRecord[r.criterionId] = String(r.rating);
    });
  }

  return {
    id: String(e.id),
    employeeId: String(e.employee?.id ?? e.employeeId),
    employeeName: e.employee?.name ?? e.employeeName ?? "",
    evaluatorUsername: e.evaluator?.adUsername ?? "",
    type: (e.type as string).toLowerCase() as "gestores" | "operacionais",
    ratings: ratingsRecord,
    average: Number(e.average),
    decision: mapDecisionFromApi(e.decision),
    justification: e.justification ?? "",
    date: e.createdAt ?? e.date ?? new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      loadInitialData();
    } else {
      setEmployees([]);
      setEvaluations([]);
      setBranches([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([refreshEmployees(), refreshEvaluations(), refreshBranches()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEmployees = async () => {
    try {
      const response = await employeeService.getAll({ limit: 500 });
      setEmployees((response.employees || []).map(mapEmployee));
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
      throw error;
    }
  };

  const refreshEvaluations = async () => {
    try {
      const response = await evaluationService.getAll({ limit: 500 });
      setEvaluations((response.evaluations || []).map(mapEvaluation));
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      throw error;
    }
  };

  const refreshBranches = async () => {
    try {
      const data = await branchService.getAll();
      setBranches(data);
    } catch (error) {
      console.error("Erro ao carregar filiais:", error);
    }
  };

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    try {
      const payload: CreateEmployeeData = {
        name: employee.name,
        position: employee.position,
        department: employee.department,
        type: employee.type,
        managerId: employee.managerId ? parseInt(employee.managerId, 10) : undefined,
        branchId: employee.branchId ? parseInt(employee.branchId, 10) : undefined,
        seniorId: employee.seniorId || undefined,
        avaliador01: employee.avaliador01 || undefined,
        avaliador02: employee.avaliador02 || undefined,
        avaliador03: employee.avaliador03 || undefined,
        avaliador04: employee.avaliador04 || undefined,
        avaliador05: employee.avaliador05 || undefined,
        avaliador06: employee.avaliador06 || undefined,
        avaliador07: employee.avaliador07 || undefined,
        avaliador08: employee.avaliador08 || undefined,
      };
      await employeeService.create(payload);
      await refreshEmployees();
      toast.success("Colaborador cadastrado com sucesso!");
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "Erro ao cadastrar colaborador"));
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await employeeService.update(id, {
        ...updates,
        managerId: updates.managerId ? parseInt(updates.managerId, 10) : updates.managerId,
        branchId: updates.branchId ? parseInt(updates.branchId, 10) : updates.branchId,
      });
      await refreshEmployees();
      toast.success("Colaborador atualizado com sucesso!");
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "Erro ao atualizar colaborador"));
      throw error;
    }
  };

  const addEvaluation = async (evaluation: Omit<Evaluation, "id" | "date">) => {
    try {
      const criteria = getCriteriaByType(evaluation.type);
      const ratingsArray = Object.entries(evaluation.ratings).map(([criterionId, rating]) => {
        const criterion = criteria.find((c) => c.id === criterionId);
        return {
          criterionId,
          criterionName: criterion?.name ?? criterionId,
          category: criterion?.category ?? "",
          weight: criterion?.weight ?? 0,
          rating: parseFloat(rating),
        };
      });

      await evaluationService.create({
        employeeId: parseInt(evaluation.employeeId, 10),
        type: evaluation.type.toUpperCase() as "GESTORES" | "OPERACIONAIS",
        decision: mapDecisionToApi(evaluation.decision),
        justification: evaluation.justification,
        ratings: ratingsArray,
      });

      await refreshEvaluations();
      toast.success("Avaliação salva com sucesso!");
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "Erro ao salvar avaliação"));
      throw error;
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find((emp) => emp.id === id);
  };

  const getEvaluationsByEmployee = (employeeId: string) => {
    return evaluations.filter((ev) => ev.employeeId === employeeId);
  };

  const getPendingEmployees = (type?: string) => {
    return employees.filter((emp) => {
      const matchesType = !type || emp.type === type;
      if (!matchesType) return false;

      const assigned = [
        emp.avaliador01, emp.avaliador02, emp.avaliador03, emp.avaliador04,
        emp.avaliador05, emp.avaliador06, emp.avaliador07, emp.avaliador08,
      ].filter(Boolean) as string[];

      const completedBy = new Set(
        evaluations.filter((ev) => ev.employeeId === emp.id).map((ev) => ev.evaluatorUsername)
      );

      if (assigned.length === 0) {
        return !evaluations.some((ev) => ev.employeeId === emp.id);
      }

      return assigned.some((username) => !completedBy.has(username));
    });
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        evaluations,
        branches,
        isLoading,
        addEmployee,
        updateEmployee,
        addEvaluation,
        getEmployeeById,
        getEvaluationsByEmployee,
        getPendingEmployees,
        refreshEmployees,
        refreshEvaluations,
        refreshBranches,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
