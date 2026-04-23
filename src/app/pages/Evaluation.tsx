import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { Layout } from "../components/Layout";
import { useApp } from "../context/AppContext";
import { getCriteriaByType } from "../data/criteria";

const ratingOptions = [
  { value: "2.5", label: "Ruim", color: "text-red-600" },
  { value: "6.5", label: "Regular", color: "text-orange-600" },
  { value: "8.5", label: "Bom", color: "text-blue-600" },
  { value: "9.5", label: "Excelente", color: "text-green-600" },
];

export function Evaluation() {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const { getEmployeeById, addEvaluation } = useApp();
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [decision, setDecision] = useState<string>("");
  const [justification, setJustification] = useState("");

  const employee = getEmployeeById(id || "");
  const employeeName = employee?.name || "Colaborador";

  // Selecionar critérios baseado no tipo
  const criteria = getCriteriaByType(type || "operacionais");
  
  const categories = Array.from(new Set(criteria.map((c) => c.category)));

  const { average, progress, classification } = useMemo(() => {
    // Calcular média ponderada
    // Os pesos dos critérios já são % do total (0-100%)
    let totalWeightedScore = 0;
    let totalWeight = 0;

    criteria.forEach((criterion) => {
      const rating = ratings[criterion.id];
      if (rating) {
        const numericRating = Number(rating);
        const criterionWeight = criterion.weight; // Peso já está em %
        totalWeightedScore += numericRating * criterionWeight;
        totalWeight += criterionWeight;
      }
    });

    const avg = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    const prog = (Object.keys(ratings).length / criteria.length) * 100;

    let classif = { label: "Não avaliado", color: "bg-gray-500" };
    if (avg > 0) {
      if (avg <= 5.00) classif = { label: "Ruim", color: "bg-red-500" };
      else if (avg < 8.00) classif = { label: "Regular", color: "bg-orange-500" };
      else if (avg < 9.00) classif = { label: "Bom", color: "bg-blue-500" };
      else classif = { label: "Excelente", color: "bg-green-500" };
    }

    return { average: avg, progress: prog, classification: classif };
  }, [ratings, criteria]);

  const handleRatingChange = (criterionId: string, value: string) => {
    setRatings((prev) => ({ ...prev, [criterionId]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const missingRatings = criteria.filter((c) => !ratings[c.id]);

    if (missingRatings.length > 0) {
      toast.error("Avaliação incompleta", {
        description: "Por favor, avalie todos os critérios antes de finalizar.",
      });
      return;
    }

    if (!decision) {
      toast.error("Decisão pendente", {
        description: "Por favor, informe a decisão (Manter ou Desligar).",
      });
      return;
    }

    if (!justification.trim()) {
      toast.error("Justificativa obrigatória", {
        description: "Por favor, adicione uma justificativa para sua decisão.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await addEvaluation({
        employeeId: id || "",
        employeeName,
        type: type as "gestores" | "operacionais",
        ratings,
        average,
        decision: decision as "manter" | "desligar" | "em_avaliacao",
        justification,
      });
      setTimeout(() => navigate("/dashboard/management"), 1500);
    } catch {
      // toast já exibido pelo AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout showSidebar={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/employees/${type}`)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {employeeName}
                  </h1>
                  <p className="text-sm text-gray-600">Avaliação de Desempenho</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {average > 0 ? average.toFixed(1) : "-"}
                </div>
                <Badge className={classification.color}>
                  {classification.label}
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              Progresso: {Math.round(progress)}% completo
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-xl">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {criteria
                    .filter((c) => c.category === category)
                    .map((criterion) => (
                      <div
                        key={criterion.id}
                        className="border-b last:border-b-0 pb-6 last:pb-0"
                      >
                        <div className="mb-3">
                          <span className="text-base font-medium text-gray-900">
                            {criterion.name}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            – {criterion.description}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {ratingOptions.map((option) => {
                            const isSelected = ratings[criterion.id] === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleRatingChange(criterion.id, option.value)}
                                className={`
                                  flex items-center justify-center h-12 rounded-lg border-2 
                                  cursor-pointer transition-all hover:bg-gray-50
                                  ${option.color}
                                  ${isSelected 
                                    ? 'border-current bg-current/5 font-semibold' 
                                    : 'border-gray-300'
                                  }
                                `}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}

            {/* Finalização */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Decisão Final</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="decision">Decisão sobre o colaborador *</Label>
                  <Select value={decision} onValueChange={setDecision}>
                    <SelectTrigger id="decision">
                      <SelectValue placeholder="Selecione a decisão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manter">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Manter</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="em_avaliacao">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 flex items-center justify-center text-blue-600">⏳</span>
                          <span>Em evolução</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="desligar">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Desligar</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Justificativa</Label>
                  <Textarea
                    id="justification"
                    placeholder="Descreva os motivos da sua decisão..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Avaliação"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}