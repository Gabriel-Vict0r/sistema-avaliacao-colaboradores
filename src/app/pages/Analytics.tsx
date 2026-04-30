import { useMemo } from "react";
import { Users, TrendingUp, UserMinus, ClipboardList } from "lucide-react";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useApp } from "../context/AppContext";
import { AdminRoute } from "../components/AdminRoute";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DECISION_COLORS: Record<string, string> = {
  Manter: "#22c55e",
  "Em análise": "#3b82f6",
  Desligar: "#ef4444",
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  Excelente: "#22c55e",
  Bom: "#3b82f6",
  Regular: "#f97316",
  Ruim: "#ef4444",
};

function getClassification(average: number) {
  if (average <= 5.0) return "Ruim";
  if (average < 8.0) return "Regular";
  if (average < 9.0) return "Bom";
  return "Excelente";
}

function getDecisionLabel(decision: string) {
  if (decision === "manter") return "Manter";
  if (decision === "em_avaliacao") return "Em análise";
  return "Desligar";
}

export function Analytics() {
  const { employees, evaluations } = useApp();

  const totalEmployees = employees.length;
  const evaluatedEmployeeIds = new Set(evaluations.map((e) => e.employeeId));
  const totalEvaluated = evaluatedEmployeeIds.size;
  const completionRate =
    totalEmployees > 0 ? Math.round((totalEvaluated / totalEmployees) * 100) : 0;

  const averageScore =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.average, 0) / evaluations.length
      : 0;

  const totalDismissals = evaluations.filter((e) => e.decision === "desligar").length;

  const decisionData = useMemo(() => {
    const counts: Record<string, number> = { Manter: 0, "Em análise": 0, Desligar: 0 };
    evaluations.forEach((e) => {
      const label = getDecisionLabel(e.decision);
      counts[label]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [evaluations]);

  const classificationData = useMemo(() => {
    const counts: Record<string, number> = { Excelente: 0, Bom: 0, Regular: 0, Ruim: 0 };
    evaluations.forEach((e) => {
      counts[getClassification(e.average)]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [evaluations]);

  const branchData = useMemo(() => {
    const employeeBranchMap = new Map(
      employees.map((emp) => [emp.id, emp.branchName ?? "Sem filial"])
    );
    const counts: Record<string, number> = {};
    evaluations.forEach((e) => {
      const branch = employeeBranchMap.get(e.employeeId) ?? "Sem filial";
      counts[branch] = (counts[branch] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [evaluations, employees]);

  const typeData = useMemo(() => {
    const counts = { Gestores: 0, Operacionais: 0 };
    evaluations.forEach((e) => {
      if (e.type === "gestores") counts.Gestores++;
      else counts.Operacionais++;
    });
    return [
      { name: "Gestores", value: counts.Gestores },
      { name: "Operacionais", value: counts.Operacionais },
    ];
  }, [evaluations]);

  return (
    <AdminRoute>
      <Layout showSidebar={true}>
        <div className="min-h-screen bg-gray-50">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">Indicadores gerais do ciclo de avaliações</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Colaboradores Avaliados</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {totalEvaluated}
                        <span className="text-lg font-normal text-gray-400">
                          /{totalEmployees}
                        </span>
                      </p>
                      <p className="text-sm text-green-600 mt-1">{completionRate}% concluído</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total de Avaliações</p>
                      <p className="text-3xl font-bold text-gray-900">{evaluations.length}</p>
                      <p className="text-sm text-gray-400 mt-1">realizadas no ciclo</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Média Geral</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {averageScore.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {getClassification(averageScore)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Decisões de Desligamento</p>
                      <p className="text-3xl font-bold text-red-600">{totalDismissals}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {evaluations.length > 0
                          ? `${Math.round((totalDismissals / evaluations.length) * 100)}% do total`
                          : "—"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <UserMinus className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts — row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Distribuição de Decisões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluations.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                      Nenhuma avaliação registrada
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={decisionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={105}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {decisionData.map((entry) => (
                            <Cell key={entry.name} fill={DECISION_COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, "Avaliações"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Distribuição de Classificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluations.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                      Nenhuma avaliação registrada
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={classificationData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                        <Tooltip formatter={(value) => [value, "Avaliações"]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {classificationData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={CLASSIFICATION_COLORS[entry.name]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts — row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Avaliações por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluations.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                      Nenhuma avaliação registrada
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={105}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#22c55e" />
                        </Pie>
                        <Tooltip formatter={(value) => [value, "Avaliações"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Avaliações por Filial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {branchData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                      Nenhuma avaliação registrada
                    </div>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(200, branchData.length * 52)}
                    >
                      <BarChart
                        data={branchData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 8, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 13 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={130}
                          tick={{ fontSize: 13 }}
                        />
                        <Tooltip formatter={(value) => [value, "Avaliações"]} />
                        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </AdminRoute>
  );
}
