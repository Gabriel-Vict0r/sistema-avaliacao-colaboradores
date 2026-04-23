import { useNavigate } from "react-router";
import { Users, UserCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { Badge } from "../components/ui/badge";

export function Dashboard() {
  const navigate = useNavigate();
  const { getPendingEmployees, evaluations } = useApp();

  const pendingManagers = getPendingEmployees("gestores");
  const pendingOperational = getPendingEmployees("operacionais");

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Avaliações
          </h1>
          <p className="text-gray-600">
            Selecione o tipo de avaliação que deseja realizar
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-7 h-7 text-blue-600" />
                </div>
                {pendingManagers.length > 0 && (
                  <Badge variant="destructive">
                    {pendingManagers.length} pendente{pendingManagers.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">Avaliar Gestores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Realize a avaliação de desempenho dos gestores da sua equipe
              </p>
              <Button
                className="w-full"
                onClick={() => navigate("/dashboard/employees/gestores")}
              >
                Iniciar Avaliação
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-green-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-green-600" />
                </div>
                {pendingOperational.length > 0 && (
                  <Badge variant="destructive">
                    {pendingOperational.length} pendente{pendingOperational.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">Avaliar Operacionais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Realize a avaliação de desempenho dos colaboradores operacionais
              </p>
              <Button
                className="w-full"
                onClick={() => navigate("/dashboard/employees/operacionais")}
              >
                Iniciar Avaliação
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {evaluations.length}
                </div>
                <p className="text-sm text-gray-600">Avaliações Realizadas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {pendingManagers.length}
                </div>
                <p className="text-sm text-gray-600">Gestores Pendentes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {pendingOperational.length}
                </div>
                <p className="text-sm text-gray-600">Operacionais Pendentes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}