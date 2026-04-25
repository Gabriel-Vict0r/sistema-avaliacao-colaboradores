import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LogIn } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { extractApiErrorMessage } from "../lib/error-handler";

export function Login() {
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      setIsLoading(true);
      const loggedUser = await login(username, password);
      toast.success("Login realizado com sucesso!");
      const destination =
        type === "admin"
          ? "/dashboard/management"
          : type
          ? `/employees/${type}`
          : loggedUser.role === "ADMIN"
          ? "/dashboard/management"
          : "/dashboard/evaluations";
      navigate(destination);
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, "Credenciais inválidas"));
      console.error("Erro de login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Avaliação
          </h1>
          <p className="text-gray-600">Sistema de Avaliação de Colaboradores</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="seu.usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar no Sistema"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">
                Informe seu usuário e senha (o mesmo que é utilizado ao ligar seu computador)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
