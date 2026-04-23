import { useNavigate } from "react-router";
import { Users, UserCheck, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Sistema de Avaliação
          </h1>
          <p className="text-lg text-gray-600">
            Selecione o tipo de avaliação que deseja realizar
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card
            className="cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 hover:border-blue-500"
            onClick={() => navigate("/login/gestores")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Avaliar Gestores</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Realize a avaliação de desempenho dos gestores da sua equipe
              </p>
              <div className="mt-6 inline-flex items-center text-blue-600 font-medium">
                Iniciar avaliação →
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 hover:border-green-500"
            onClick={() => navigate("/login/operacionais")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Avaliar Operacionais</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Realize a avaliação de desempenho dos colaboradores operacionais
              </p>
              <div className="mt-6 inline-flex items-center text-green-600 font-medium">
                Iniciar avaliação →
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card discreto de acesso administrativo */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            className="text-sm text-gray-600 hover:text-blue-600"
            onClick={() => navigate("/login/admin")}
          >
            Acesso ao Painel Administrativo →
          </Button>
        </div>
      </div>
    </div>
  );
}