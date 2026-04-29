import { useState, startTransition } from "react";
import { useNavigate, useParams } from "react-router";
import { Search, ArrowLeft, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Layout } from "../components/Layout";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export function Employees() {
  const navigate = useNavigate();
  const { type } = useParams();
  const { user } = useAuth();
  const { employees, evaluations } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const currentUsername = user?.adUsername ?? "";

  const AVALIADOR_FIELDS = [
    "avaliador01", "avaliador02", "avaliador03", "avaliador04",
    "avaliador05", "avaliador06", "avaliador07", "avaliador08",
  ] as const;

  const typeEmployees = employees.filter((emp) => {
    if (emp.type !== type) return false;
    return AVALIADOR_FIELDS.some((field) => emp[field] === currentUsername);
  });

  const departments = Array.from(
    new Set(typeEmployees.map((emp) => emp.department))
  );

  const filteredEmployees = typeEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const hasEvaluation = (employeeId: string) => {
    return evaluations.some(
      (ev) => ev.employeeId === employeeId && ev.evaluatorUsername === currentUsername
    );
  };

  return (
    <Layout showSidebar={false}>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Colaboradores para Avaliação
                </h1>
                <p className="text-sm text-gray-600 capitalize">
                  {type?.replace("-", " ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nome ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filtrar por setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setores</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredEmployees.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Nenhum colaborador encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredEmployees.map((employee) => {
              const evaluated = hasEvaluation(employee.id);
              
              return (
                <Card
                  key={employee.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {employee.name}
                            </h3>
                            {evaluated && (
                              <Badge className="bg-green-500">Avaliado</Badge>
                            )}
                            {!evaluated && (
                              <Badge variant="destructive">Pendente</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {employee.position}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {employee.department}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          startTransition(() =>
                            navigate(`/dashboard/evaluation/${type}/${employee.id}`)
                          )
                        }
                        disabled={evaluated}
                      >
                        {evaluated ? "Já Avaliado" : "Avaliar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {filteredEmployees.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando {filteredEmployees.length} colaborador(es)
          </div>
        )}
      </div>
    </Layout>
  );
}