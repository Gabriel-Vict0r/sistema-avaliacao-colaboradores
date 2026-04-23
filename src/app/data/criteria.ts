export interface Criterion {
  id: string;
  name: string;
  description: string;
  category: string;
  weight: number;
}

export const criteriaGestores: Criterion[] = [
  { id: "exec1", name: "Planejamento", description: "Organiza e prioriza as atividades do dia a dia", category: "Execução e Processos", weight: 5 },
  { id: "exec2", name: "Execução", description: "Cumpre prazos e o planejado", category: "Execução e Processos", weight: 6 },
  { id: "exec3", name: "Controle", description: "Acompanha, cobra e ajusta as atividades", category: "Execução e Processos", weight: 6 },
  { id: "exec4", name: "Processos", description: "Segue e garante os padrões definidos", category: "Execução e Processos", weight: 4 },
  { id: "exec5", name: "Segurança (EPI)", description: "Cumpre e cobra o uso correto de EPIs", category: "Execução e Processos", weight: 4 },
  { id: "exec6", name: "Capricho", description: "Atua com atenção aos detalhes e qualidade, mantém ambiente limpo e organizado", category: "Execução e Processos", weight: 5 },
  { id: "lead1", name: "Gestão da equipe", description: "Orienta, acompanha e desenvolve o time", category: "Liderança", weight: 5 },
  { id: "lead2", name: "Feedback / Correção", description: "Corrige e elogia quando necessário", category: "Liderança", weight: 4 },
  { id: "lead3", name: "União da equipe", description: "Mantém o time alinhado e engajado", category: "Liderança", weight: 3 },
  { id: "lead4", name: "Comunicação", description: "Se comunica com clareza e escuta a equipe", category: "Liderança", weight: 4 },
  { id: "lead5", name: "Delegação", description: "Distribui e acompanha as atividades", category: "Liderança", weight: 3 },
  { id: "lead6", name: "Backup (Sucessão)", description: "Prepara substitutos e garante continuidade", category: "Liderança", weight: 3 },
  { id: "lead7", name: "Tratamento de Conflitos", description: "Resolve problemas da equipe antes de piorarem", category: "Liderança", weight: 3 },
  { id: "post1", name: "Responsabilidade", description: "Cumpre compromissos e assume resultados", category: "Postura", weight: 3 },
  { id: "post2", name: "Confiança", description: "Age com ética, transparência e coerência", category: "Postura", weight: 2 },
  { id: "post3", name: "Mentalidade de Dono", description: "Busca o melhor resultado com menor custo", category: "Postura", weight: 3 },
  { id: "post4", name: "Equilíbrio emocional", description: "Lida com pressão sem repassar para a equipe", category: "Postura", weight: 2 },
  { id: "post5", name: "Humildade", description: "Reconhece erros e busca melhorar", category: "Postura", weight: 2 },
  { id: "post6", name: "Desenvolvimento pessoal", description: "Busca aprendizado contínuo", category: "Postura", weight: 2 },
  { id: "post7", name: "Iniciativa", description: "Age sem precisar ser cobrado", category: "Postura", weight: 2 },
  { id: "post8", name: "Visão Estratégica", description: "Entende o impacto das ações nos resultados", category: "Postura", weight: 2 },
  { id: "post9", name: "Relacionamento", description: "Mantém boa convivência com equipe e áreas", category: "Postura", weight: 2 },
  { id: "result1", name: "Qualidade", description: "Entrega dentro do padrão esperado", category: "Resultados", weight: 5 },
  { id: "result2", name: "Resultado da área", description: "Atinge metas e objetivos", category: "Resultados", weight: 7 },
  { id: "result3", name: "Capacidade analítica", description: "Analisa e resolve problemas", category: "Resultados", weight: 4 },
  { id: "result4", name: "Visão financeira", description: "Evita desperdícios, e se preocupa com os custos da operação", category: "Resultados", weight: 3 },
  { id: "result5", name: "Melhoria contínua", description: "Busca fazer melhor, mais rápido e com menos recurso", category: "Resultados", weight: 3 },
  { id: "result6", name: "Capacidade de negociação", description: "Alinha prazos e entregas sem perder qualidade", category: "Resultados", weight: 3 },
];

export const criteriaOperacionais: Criterion[] = [
  { id: "exec1", name: "Qualidade", description: "Entrega o trabalho bem-feito, sem erros", category: "Execução", weight: 12 },
  { id: "exec2", name: "Atenção", description: "Presta atenção no que foi solicitado", category: "Execução", weight: 3 },
  { id: "exec3", name: "Processos", description: "Executa conforme os processos definidos", category: "Execução", weight: 8 },
  { id: "exec4", name: "Segurança (EPI)", description: "Utiliza corretamente os EPIs", category: "Execução", weight: 4 },
  { id: "exec5", name: "Capricho", description: "Realiza o trabalho com cuidado, organização e zelo", category: "Execução", weight: 5 },
  { id: "behav1", name: "Disciplina", description: "Cumpre horários e regras da empresa", category: "Comportamento", weight: 4 },
  { id: "behav2", name: "Relacionamento", description: "Trabalha bem com a equipe e liderança", category: "Comportamento", weight: 2 },
  { id: "behav3", name: "Comunicação", description: "Entende e transmite informações com clareza", category: "Comportamento", weight: 2 },
  { id: "behav4", name: "Equilíbrio", description: "Mantém controle emocional sob pressão", category: "Comportamento", weight: 5 },
  { id: "behav5", name: "Iniciativa", description: "Age sem precisar ser solicitado", category: "Comportamento", weight: 5 },
  { id: "behav6", name: "Vontade de aprender", description: "Demonstra interesse em evoluir", category: "Comportamento", weight: 5 },
  { id: "behav7", name: "Interesse pela empresa", description: "Demonstra interesse e se preocupa com os resultados da empresa", category: "Comportamento", weight: 5 },
  { id: "result1", name: "Produtividade", description: "Entrega no prazo ou acima do esperado", category: "Resultado/Entrega", weight: 12 },
  { id: "result2", name: "Comprometimento", description: "Cumpre o que foi combinado e assume responsabilidades", category: "Resultado/Entrega", weight: 10 },
  { id: "result3", name: "Cuidado com equipamentos", description: "Zela por máquinas e ferramentas", category: "Resultado/Entrega", weight: 8 },
  { id: "capac1", name: "Conhecimento da atividade", description: "Domina o trabalho que executa", category: "Capacidade", weight: 4 },
  { id: "capac2", name: "Tomada de decisão", description: "Resolve problemas com autonomia", category: "Capacidade", weight: 3 },
  { id: "capac3", name: "Sugestão de melhoria", description: "Propõe ideias para melhoria", category: "Capacidade", weight: 3 },
];

export function getCriteriaByType(type: string): Criterion[] {
  return type === 'gestores' ? criteriaGestores : criteriaOperacionais;
}
