import { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { AdUserCombobox } from "./AdUserCombobox";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  position: "",
  department: "",
  type: "" as "gestores" | "operacionais" | "",
  managerId: "",
  branchId: "",
  seniorId: "",
  avaliador01: "",
  avaliador02: "",
  avaliador03: "",
  avaliador04: "",
  avaliador05: "",
  avaliador06: "",
  avaliador07: "",
  avaliador08: "",
};

export function AddEmployeeDialog() {
  const { addEmployee, employees, branches } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvaluators, setShowEvaluators] = useState(false);

  const managers = employees.filter((emp) => emp.type === "gestores");

  const set = (field: keyof typeof EMPTY_FORM, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.position || !formData.department || !formData.type) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await addEmployee({
        name: formData.name,
        position: formData.position,
        department: formData.department,
        type: formData.type as "gestores" | "operacionais",
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
      setFormData(EMPTY_FORM);
      setShowEvaluators(false);
      setOpen(false);
    } catch {
      // toast já exibido pelo AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Colaborador
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Novo Colaborador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">

            {/* Dados principais */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => set("position", e.target.value)}
                placeholder="Ex: Analista de Vendas"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Setor *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => set("department", e.target.value)}
                  placeholder="Ex: Comercial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seniorId">Matrícula Senior</Label>
                <Input
                  id="seniorId"
                  value={formData.seniorId}
                  onChange={(e) => set("seniorId", e.target.value)}
                  placeholder="Código no sistema"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "gestores" | "operacionais") => set("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestores">Gestor</SelectItem>
                    <SelectItem value="operacionais">Operacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Filial</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => set("branchId", value)}
                >
                  <SelectTrigger id="branch">
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
              <Label htmlFor="manager">Gestor Responsável</Label>
              <Select
                value={formData.managerId}
                onValueChange={(value) => set("managerId", value)}
              >
                <SelectTrigger id="manager">
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

            {/* Seção de avaliadores */}
            <div className="border rounded-lg">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setShowEvaluators((v) => !v)}
              >
                <span>Avaliadores do AD</span>
                {showEvaluators ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showEvaluators && (
                <div className="px-4 pb-4 space-y-3 border-t">
                  <p className="text-xs text-gray-500 pt-3">
                    Selecione os usuários do Active Directory que podem avaliar este colaborador.
                    Digite ao menos 2 caracteres para buscar.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {([
                      "avaliador01", "avaliador02", "avaliador03", "avaliador04",
                      "avaliador05", "avaliador06", "avaliador07", "avaliador08",
                    ] as const).map((key, i) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20 shrink-0">
                          Avaliador {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1">
                          <AdUserCombobox
                            value={formData[key]}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Colaborador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
