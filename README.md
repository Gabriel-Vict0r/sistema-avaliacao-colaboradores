# Sistema de Avaliação 180° - Colaboradores

Sistema web moderno e profissional para avaliação de desempenho de colaboradores pelo método 180 graus, com foco em gestores.

## 🎯 Funcionalidades Principais

### 📊 Dashboard de Avaliações
- **Seleção de tipo de avaliação**: Gestores ou Operacionais
- **Estatísticas rápidas**: Total de avaliações, pendências por tipo
- **Badges de pendências**: Visualização imediata do que precisa ser feito

### 🔐 Sistema de Login
- Acesso seguro ao sistema
- Interface clean e profissional
- Feedback de erros em tempo real

### 👥 Gerenciamento Completo
Sistema completo com 3 áreas principais acessíveis via sidebar:

#### 1. Avaliações Realizadas
- Listagem completa de todas as avaliações
- Filtros por tipo, setor e período
- Visualização de média, classificação e decisão
- Botão de visualização de detalhes
- Tabela organizada com informações-chave

#### 2. Colaboradores
- Lista de todos os colaboradores cadastrados
- Informações de cargo, setor e tipo (Gestor/Operacional)
- **Cadastro de novos colaboradores** via modal
- Campos: Nome, Cargo, Setor, Tipo, Gestor Responsável
- Filtros por tipo e setor
- Busca por nome ou cargo

#### 3. Pendentes de Avaliação
- Lista visual de colaboradores não avaliados
- Badges de alerta "Pendente"
- Ação rápida: "Avaliar Agora"
- Filtros por tipo e setor

### ✍️ Sistema de Avaliação
- **16 critérios** divididos em 4 categorias
- **Barra de progresso** em tempo real
- **Média automática** com classificação visual
- **Radio buttons visuais** para cada critério (Ruim, Regular, Bom, Excelente)
- **Decisão final**: Manter ou Desligar
- **Justificativa obrigatória**
- Validações completas antes de salvar

### 📱 Visualização de Detalhes
- Tela completa com todos os dados da avaliação
- Visualização das notas por categoria
- Barras de progresso para cada critério
- Informações do colaborador
- Justificativa da decisão

## 📂 Estrutura de Navegação

### Sidebar Fixa
- **Avaliações**: Dashboard principal com cards de seleção
- **Gerenciamento**: Área completa com 3 abas (Realizadas, Colaboradores, Pendentes)
- **Sair**: Logout do sistema

## 📊 Categorias de Avaliação

### 🔧 Execução
- Qualidade do trabalho entregue
- Cumprimento de prazos
- Organização e planejamento
- Conhecimento técnico

### 👔 Liderança
- Capacidade de motivar a equipe
- Tomada de decisões
- Resolução de conflitos
- Desenvolvimento da equipe

### 💬 Comportamento
- Comunicação e clareza
- Trabalho em equipe
- Proatividade e iniciativa
- Comprometimento

### 📈 Resultados
- Atingimento de metas
- Produtividade
- Melhoria contínua
- Impacto nos resultados da empresa

## 🎨 Design

- **Layout moderno e corporativo**
- **Cores neutras** (cinza, branco) com **azul** como cor primária
- **Sidebar fixa** para navegação rápida
- **Design responsivo** para desktop e tablet
- **Componentes consistentes**: Cards com sombra, badges, tabelas
- **Feedback visual** em tempo real
- **Interface intuitiva** e direta

## 🚀 Fluxo de Uso

### Para Avaliações:
1. Faça login no sistema
2. No dashboard, selecione o tipo (Gestores ou Operacionais)
3. Escolha um colaborador da lista
4. Avalie todos os 16 critérios
5. Visualize a média em tempo real
6. Tome a decisão final (Manter/Desligar)
7. Adicione justificativa
8. Salve a avaliação

### Para Gerenciamento:
1. Acesse "Gerenciamento" na sidebar
2. **Aba "Avaliações Realizadas"**: Veja histórico completo com filtros
3. **Aba "Colaboradores"**: Gerencie a base de dados, adicione novos
4. **Aba "Pendentes"**: Identifique rapidamente quem precisa ser avaliado

## 🔔 Notificações

Sistema de toasts (Sonner) para feedback imediato:
- Sucesso ao salvar avaliações
- Erros de validação
- Confirmações de ações
- Cadastro de colaboradores

## 💾 Gestão de Dados

- **Context API** para gerenciamento de estado global
- Persistência em memória (dados mantidos durante a sessão)
- Colaboradores pré-cadastrados para demonstração
- Sistema pronto para integração com backend

## 🎯 Diferenciais

✅ Navegação fluida com sidebar persistente  
✅ Sistema completo de gerenciamento  
✅ Modal de cadastro de colaboradores  
✅ Filtros avançados em todas as abas  
✅ Status visual (Avaliado/Pendente)  
✅ Detalhamento completo de avaliações  
✅ Média calculada em tempo real  
✅ Validações robustas  
✅ Design profissional e limpo  
✅ Experiência de usuário otimizada  

## 📦 Tecnologias

- React 18
- TypeScript
- React Router (Data Mode)
- Tailwind CSS v4
- Radix UI Components
- Sonner (Toast notifications)
- Lucide Icons
- Context API

---

**Sistema desenvolvido para facilitar o processo de avaliação 180° com foco em gestores, oferecendo uma experiência completa desde a avaliação até o gerenciamento de colaboradores.**
