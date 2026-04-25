import { useState, useEffect } from "react";
import { Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { AdUserCombobox } from "./AdUserCombobox";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useApp } from "../context/AppContext";
import { employeeService } from "../services/employee.service";
import { Employee } from "../context/AppContext";
import { toast } from "sonner";
import { extractApiErrorMessage } from "../lib/error-handler";

interface Props {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVALIADOR_FIELDS = [
  "avaliador01", "avaliador02", "avaliador03", "avaliador04",
  "avaliador05", "avaliador06", "avaliador07", "avaliador08",
] as const;

export function EditEmployeeDialog({ employee, open, onOpenChange }: Props) {
  const { updateEmployee, refreshEmployees, employees, branches } = useApp();
  const [formData, setFormData] = useState({ ...employee });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showEvaluators, setShowEvaluators] = useState(false);

  useEffect(() => {
    if (open) setFormData({ ...employee });
  }, [open, employee]);

  const managers = employees.filter((emp) => emp.type === "gestores" && emp.id !== employee.id);

  const set = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.position || !formData.department || !formData.type) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      setIsSubmitting(true);
      await updateEmployee(employee.id, {
        name: formData.name,
        position: formData.position,
        department: formData.department,
        type: formData.type,
        managerId: formData.managerId || undefined,
        branchId: formData.branchId || undefined,
        seniorId: formData.seniorId || undefined,
        avaliador01: formData.avaliador01 || undefined,
        avaliador02: formData.avaliador02 || undefined,
        avaliador03: formData.avaliador03 || undefined,
        avaliador04: formData.avaliador04 || undefined,
        avaliador05: formData.avaliador05 || undefined,
        avaliador06: formData.avaliador06 || undefined,
        avaliador07: formData.avaliador07 || undefined,
        avaliador08: formData.avaliador08 || undefined,
      });
      onOpenChange(false);
    } catch {
      // toast já exibido pelo AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm(`Desabilitar o colaborador "${employee.name}"? Esta ação pode ser revertida pelo administrador.`)) return;
    try {
      setIsDeactivating(true);
      await employeeService.delete(employee.id);
      toast.success("Colaborador desabilitado com sucesso!");
      await refreshEmployees();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "Erro ao desabilitar colaborador"));
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar Colaborador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-position">Cargo *</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) => set("position", e.target.value)}
                placeholder="Ex: Analista de Vendas"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Setor *</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => set("department", e.target.value)}
                  placeholder="Ex: Comercial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-seniorId">Matrícula Senior</Label>
                <Input
                  id="edit-seniorId"
                  value={formData.seniorId ?? ""}
                  onChange={(e) => set("seniorId", e.target.value)}
                  placeholder="Código no sistema"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "gestores" | "operacionais") => set("type", value)}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestores">Gestor</SelectItem>
                    <SelectItem value="operacionais">Operacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-branch">Filial</Label>
                <Select
                  value={formData.branchId ?? ""}
                  onValueChange={(value) => set("branchId", value)}
                >
                  <SelectTrigger id="edit-branch">
                    <SelectValue placeholder="Selecione a filial" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.name} ({branch.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-manager">Gestor Responsável</Label>
              <Select
                value={formData.managerId ?? ""}
                onValueChange={(value) => set("managerId", value)}
              >
                <SelectTrigger id="edit-manager">
                  <SelectValue placeholder="Selecione o gestor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowEvaluators((v) => !v)}
              >
                <span>Avaliadores do AD</span>
                {showEvaluators ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showEvaluators && (
                <div className="px-4 pb-4 space-y-3 border-t">
                  <p className="text-xs text-gray-500 pt-3">
                    Selecione os usuários do Active Directory que podem avaliar este colaborador.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {AVALIADOR_FIELDS.map((key, i) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20 shrink-0">
                          Avaliador {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1">
                          <AdUserCombobox
                            value={formData[key] ?? ""}
                            onChange={(v) => set(key, v)}
                            placeholder="Buscar no Active Directory..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isDeactivating || isSubmitting}
              className="sm:mr-auto"
            >
              {isDeactivating ? "Desabilitando..." : "Desabilitar Colaborador"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isDeactivating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeactivating}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
