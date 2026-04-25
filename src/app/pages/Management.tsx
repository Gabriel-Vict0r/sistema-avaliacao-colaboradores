import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Calendar, Eye, User, AlertCircle, Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { useApp } from "../context/AppContext";
import { Employee } from "../context/AppContext";
import { AddEmployeeDialog } from "../components/AddEmployeeDialog";
import { EditEmployeeDialog } from "../components/EditEmployeeDialog";
import { branchService, Branch } from "../services/branch.service";
import { toast } from "sonner";
import { extractApiErrorMessage } from "../lib/error-handler";

export function Management() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, evaluations, branches, getPendingEmployees, refreshBranches } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPendingBranch, setFilterPendingBranch] = useState("all");

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Branch management state
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({ name: "", code: "" });
  const [isSavingBranch, setIsSavingBranch] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      navigate("/dashboard/evaluations", { replace: true });
    }
  }, [user, navigate]);

  const departments = Array.from(new Set(employees.map((emp) => emp.department)));

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch = evaluation.employeeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || evaluation.type === filterType;
    const matchesDepartment =
      filterDepartment === "all" ||
      employees.find((emp) => emp.id === evaluation.employeeId)?.department ===
        filterDepartment;
    return matchesSearch && matchesType && matchesDepartment;
  });

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || employee.department === filterDepartment;
    const matchesType = filterType === "all" || employee.type === filterType;
    return matchesSearch && matchesDepartment && matchesType;
  });

  const pendingEmployees = getPendingEmployees().filter((employee) => {
    const matchesSearch = employee.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || employee.department === filterDepartment;
    const matchesType = filterType === "all" || employee.type === filterType;
    const matchesBranch =
      filterPendingBranch === "all" || employee.branchId === filterPendingBranch;
    return matchesSearch && matchesDepartment && matchesType && matchesBranch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getClassificationBadge = (average: number) => {
    if (average <= 5.0) return <Badge className="bg-red-500">Ruim</Badge>;
    if (average < 8.0) return <Badge className="bg-orange-500">Regular</Badge>;
    if (average < 9.0) return <Badge className="bg-blue-500">Bom</Badge>;
    return <Badge className="bg-green-500">Excelente</Badge>;
  };

  const getDecisionBadge = (decision: string) => {
    if (decision === "manter")
      return <Badge variant="outline" className="text-green-700 border-green-700">Manter</Badge>;
    if (decision === "em_avaliacao")
      return <Badge variant="outline" className="text-blue-700 border-blue-700">Em análise</Badge>;
    return <Badge variant="outline" className="text-red-700 border-red-700">Desligar</Badge>;
  };

  // Branch handlers
  const openAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({ name: "", code: "" });
    setBranchDialogOpen(true);
  };

  const openEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({ name: branch.name, code: branch.code });
    setBranchDialogOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.code) {
      toast.error("Nome e código são obrigatórios");
      return;
    }
    try {
      setIsSavingBranch(true);
      if (editingBranch) {
        await branchService.update(editingBranch.id, branchForm);
        toast.success("Filial atualizada com sucesso!");
      } else {
        await branchService.create(branchForm);
        toast.success("Filial cadastrada com sucesso!");
      }
      await refreshBranches();
      setBranchDialogOpen(false);
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "Erro ao salvar filial"));
    } finally {
      setIsSavingBranch(false);
    }
  };

  const handleDeactivateBranch = async (branch: Branch) => {
    if (!confirm(`Desativar a filial "${branch.name}"?`)) return;
    try {
      await branchService.deactivate(branch.id);
      toast.success("Filial desativada com sucesso!");
      await refreshBranches();
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "Erro ao desativar filial"));
    }
  };

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento</h1>
            <p className="text-gray-600">Acompanhe avaliações, colaboradores e pendências</p>
          </div>

          <Tabs defaultValue="completed" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-4">
              <TabsTrigger value="completed">Avaliações</TabsTrigger>
              <TabsTrigger value="employees">Colaboradores</TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes
                {pendingEmployees.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingEmployees.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="branches">
                <Building2 className="w-4 h-4 mr-1" />
                Filiais
              </TabsTrigger>
            </TabsList>

            {/* Aba: Avaliações Realizadas */}
            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="gestores">Gestores</SelectItem>
                        <SelectItem value="operacionais">Operacionais</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os setores</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredEvaluations.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma avaliação encontrada</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Média</TableHead>
                            <TableHead>Classificação</TableHead>
                            <TableHead>Decisão</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvaluations.map((evaluation) => (
                            <TableRow key={evaluation.id}>
                              <TableCell className="font-medium">
                                {evaluation.employeeName}
                              </TableCell>
                              <TableCell className="capitalize">
                                {evaluation.type === "gestores" ? "Gestor" : "Operacional"}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">
                                  {evaluation.average.toFixed(1)}
                                </span>
                              </TableCell>
                              <TableCell>{getClassificationBadge(evaluation.average)}</TableCell>
                              <TableCell>{getDecisionBadge(evaluation.decision)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(evaluation.date)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/dashboard/evaluation-details/${evaluation.id}`)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Detalhes
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Colaboradores */}
            <TabsContent value="employees" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4 flex-1">
                  <Input
                    placeholder="Buscar por nome ou cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="gestores">Gestores</SelectItem>
                      <SelectItem value="operacionais">Operacionais</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os setores</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AddEmployeeDialog />
              </div>

              <div className="grid gap-4">
                {filteredEmployees.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500">Nenhum colaborador encontrado</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredEmployees.map((employee) => (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                              <p className="text-sm text-gray-600">{employee.position}</p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <Badge variant="secondary">{employee.department}</Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    employee.type === "gestores"
                                      ? "text-blue-700 border-blue-700"
                                      : "text-green-700 border-green-700"
                                  }
                                >
                                  {employee.type === "gestores" ? "Gestor" : "Operacional"}
                                </Badge>
                                {employee.branchName && (
                                  <Badge variant="outline" className="text-gray-600">
                                    <Building2 className="w-3 h-3 mr-1" />
                                    {employee.branchName}
                                  </Badge>
                                )}
                                {employee.seniorId && (
                                  <Badge variant="outline" className="text-gray-500 text-xs">
                                    Mat. {employee.seniorId}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEmployee(employee)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Aba: Pendentes */}
            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4 mb-6">
                    <Input
                      placeholder="Buscar por nome..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-md"
                    />
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="gestores">Gestores</SelectItem>
                        <SelectItem value="operacionais">Operacionais</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os setores</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterPendingBranch} onValueChange={setFilterPendingBranch}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filial" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as filiais</SelectItem>
                        {branches.filter((b) => b.isActive).map((branch) => (
                          <SelectItem key={branch.id} value={String(branch.id)}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {pendingEmployees.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Todos os colaboradores foram avaliados!</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {pendingEmployees.map((employee) => (
                        <Card key={employee.id} className="border-l-4 border-l-orange-500">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                                    <Badge variant="destructive">Pendente</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{employee.position}</p>
                                  <div className="flex gap-2 mt-1 flex-wrap items-center">
                                    <Badge variant="secondary">{employee.department}</Badge>
                                    {(() => {
                                      const assigned = [
                                        employee.avaliador01, employee.avaliador02,
                                        employee.avaliador03, employee.avaliador04,
                                        employee.avaliador05, employee.avaliador06,
                                        employee.avaliador07, employee.avaliador08,
                                      ].filter(Boolean) as string[];
                                      const completedBy = new Set(
                                        evaluations
                                          .filter((ev) => ev.employeeId === employee.id)
                                          .map((ev) => ev.evaluatorUsername)
                                      );
                                      return assigned
                                        .filter((u) => !completedBy.has(u))
                                        .map((username) => (
                                          <Badge
                                            key={username}
                                            variant="outline"
                                            className="text-xs text-orange-700 border-orange-300 bg-orange-50"
                                          >
                                            {username}
                                          </Badge>
                                        ));
                                    })()}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  navigate(`/dashboard/evaluation/${employee.type}/${employee.id}`)
                                }
                              >
                                Avaliar Agora
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Filiais */}
            <TabsContent value="branches" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {branches.length} filial(is) cadastrada(s)
                </p>
                <Button onClick={openAddBranch}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Filial
                </Button>
              </div>

              {branches.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma filial cadastrada</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branches.map((branch) => (
                          <TableRow key={branch.id}>
                            <TableCell className="font-medium">{branch.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{branch.code}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={branch.isActive ? "text-green-700 border-green-700" : "text-gray-500"}
                              >
                                {branch.isActive ? "Ativa" : "Inativa"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditBranch(branch)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeactivateBranch(branch)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => { if (!open) setEditingEmployee(null); }}
        />
      )}

      {/* Branch Dialog */}
      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Editar Filial" : "Nova Filial"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBranch}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="branch-name">Nome *</Label>
                <Input
                  id="branch-name"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Filial São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-code">Código *</Label>
                <Input
                  id="branch-code"
                  value={branchForm.code}
                  onChange={(e) => setBranchForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="Ex: SP-01"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBranchDialogOpen(false)}
                disabled={isSavingBranch}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingBranch}>
                {isSavingBranch ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
