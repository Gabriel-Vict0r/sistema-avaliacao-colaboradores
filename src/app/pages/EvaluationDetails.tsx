import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Layout } from "../components/Layout";
import { Separator } from "../components/ui/separator";
import { evaluationService } from "../services/evaluation.service";

interface ApiRating {
  id: string;
  criterionId: string;
  criterionName: string;
  category: string;
  weight: number;
  rating: number;
}

interface ApiEvaluation {
  id: string;
  type: string;
  average: number;
  decision: string;
  justification: string;
  pointsImprovement?: string | null;
  createdAt: string;
  employee: { id: string; name: string; position: string; department: string };
  evaluator: { id: string; name: string; email: string };
  ratings: ApiRating[];
}

const ratingLabel = (rating: number) => {
  if (rating <= 2.5) return { label: "Ruim", color: "bg-red-500" };
  if (rating <= 6.5) return { label: "Regular", color: "bg-orange-500" };
  if (rating <= 8.5) return { label: "Bom", color: "bg-blue-500" };
  return { label: "Excelente", color: "bg-green-500" };
};

const classificationBadge = (average: number) => {
  if (average <= 5.0) return <Badge className="bg-red-500">Ruim</Badge>;
  if (average < 8.0) return <Badge className="bg-orange-500">Regular</Badge>;
  if (average < 9.0) return <Badge className="bg-blue-500">Bom</Badge>;
  return <Badge className="bg-green-500">Excelente</Badge>;
};

const decisionLabel = (decision: string) => {
  const map: Record<string, string> = {
    MANTER: "Manter",
    DESLIGAR: "Desligar",
    EM_EVOLUCAO: "Em análise",
  };
  return map[decision] ?? decision;
};

export function EvaluationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [evaluation, setEvaluation] = useState<ApiEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    evaluationService
      .getById(id)
      .then((data) => setEvaluation(data))
      .catch(() => setError("Avaliação não encontrada ou sem permissão de acesso."))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <Layout showSidebar={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  if (error || !evaluation) {
    return (
      <Layout showSidebar={true}>
        <div className="p-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">{error ?? "Avaliação não encontrada"}</p>
              <Button className="mt-4" onClick={() => navigate("/dashboard/management")}>
                Voltar ao Gerenciamento
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const categories = Array.from(new Set(evaluation.ratings.map((r) => r.category)));

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/dashboard/management")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Detalhes da Avaliação</h1>
                  <p className="text-sm text-gray-600">{evaluation.employee.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {evaluation.average.toFixed(1)}
                </div>
                {classificationBadge(evaluation.average)}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Colaborador</p>
                  <p className="font-semibold text-gray-900">{evaluation.employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cargo</p>
                  <p className="font-semibold text-gray-900">{evaluation.employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Setor</p>
                  <p className="font-semibold text-gray-900">{evaluation.employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo</p>
                  <Badge
                    variant="outline"
                    className={
                      evaluation.type === "GESTORES"
                        ? "text-blue-700 border-blue-700"
                        : "text-green-700 border-green-700"
                    }
                  >
                    {evaluation.type === "GESTORES" ? "Gestor" : "Operacional"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avaliador</p>
                  <p className="font-semibold text-gray-900">{evaluation.evaluator.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Data da Avaliação</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="font-semibold text-gray-900">{formatDate(evaluation.createdAt)}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Decisão</p>
                  <div className="flex items-center gap-2">
                    {evaluation.decision === "MANTER" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : evaluation.decision === "EM_EVOLUCAO" ? (
                      <span className="text-xl">⏳</span>
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {decisionLabel(evaluation.decision)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critérios por categoria */}
          {evaluation.ratings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Nenhum critério registrado para esta avaliação.
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => {
              const categoryRatings = evaluation.ratings.filter((r) => r.category === category);
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-xl">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryRatings.map((r, idx) => {
                        const { label, color } = ratingLabel(r.rating);
                        const isLast = idx === categoryRatings.length - 1;
                        return (
                          <div key={r.criterionId}>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{r.criterionName}</p>
                              </div>
                              <Badge className={color}>{label}</Badge>
                            </div>
                            <div className="flex gap-1">
                              {[2.5, 6.5, 8.5, 9.5].map((level) => (
                                <div
                                  key={level}
                                  className={`h-2 flex-1 rounded-full ${
                                    r.rating >= level ? color : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            {!isLast && <Separator className="mt-4" />}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}

          {/* Justificativa */}
          <Card>
            <CardHeader>
              <CardTitle>Justificativa da Decisão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{evaluation.justification}</p>
            </CardContent>
          </Card>

          {/* Pontos de melhoria (opcional) */}
          {evaluation.pointsImprovement && (
            <Card>
              <CardHeader>
                <CardTitle>Pontos de Melhoria</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{evaluation.pointsImprovement}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
