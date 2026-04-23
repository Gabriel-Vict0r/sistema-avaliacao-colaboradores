# API Backend - Sistema de Avaliação 180°

## 📋 Índice de Documentação

Este projeto contém a documentação completa para desenvolvimento da API backend do Sistema de Avaliação de Colaboradores.

---

## 📚 Documentos Disponíveis

### 1. [ESCOPO_API_BACKEND.md](./ESCOPO_API_BACKEND.md)
**Documento principal** com especificação completa da API:
- Arquitetura técnica e stack recomendado
- Modelo de dados completo (Prisma Schema)
- Todos os endpoints da API com exemplos
- Sistema de autenticação e autorização (JWT + RBAC)
- Validações de negócio
- Tratamento de erros
- Segurança e boas práticas
- Roadmap de implementação (6 fases)

### 2. [EXEMPLOS_IMPLEMENTACAO_API.md](./EXEMPLOS_IMPLEMENTACAO_API.md)
**Exemplos práticos de código** para implementação:
- Setup inicial do projeto (Node.js + TypeScript + Prisma)
- Configuração completa do Prisma
- Implementação de middlewares (auth, RBAC, validação)
- Services completos (Auth, Evaluation)
- Controllers com tratamento de erros
- Routes configuradas
- Seed inicial do banco de dados
- Comandos úteis para desenvolvimento

### 3. [INTEGRACAO_FRONTEND.md](./INTEGRACAO_FRONTEND.md)
**Guia de integração** do frontend atual com a API:
- Configuração do Axios
- Implementação de services no frontend
- AuthContext para gerenciamento de autenticação
- Atualização do AppContext para usar API
- Proteção de rotas
- Tratamento de erros e loading states
- Checklist completo de migração
- Testes de integração

---

## 🚀 Quick Start

### 1. Backend (Criar novo diretório)

```bash
# Criar projeto backend
mkdir backend
cd backend

# Inicializar projeto
npm init -y

# Instalar dependências
npm install express prisma @prisma/client bcryptjs jsonwebtoken zod dotenv helmet cors express-rate-limit

# Instalar dev dependencies
npm install -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken tsx nodemon

# Inicializar Prisma
npx prisma init

# Copiar schema do ESCOPO_API_BACKEND.md para prisma/schema.prisma

# Configurar .env
DATABASE_URL="postgresql://user:password@localhost:5432/avaliacao_db"
JWT_SECRET="sua-chave-secreta-forte"
FRONTEND_URL="http://localhost:5173"

# Criar e executar migrations
npx prisma migrate dev --name init

# Executar seed
npx prisma db seed

# Iniciar servidor
npm run dev
```

### 2. Frontend (Atualizar projeto atual)

```bash
# Instalar Axios
pnpm add axios

# Criar arquivo .env.local
echo "VITE_API_URL=http://localhost:3000/api" > .env.local

# Implementar conforme INTEGRACAO_FRONTEND.md:
# - Criar src/lib/api.ts
# - Criar src/services/*.ts
# - Criar src/context/AuthContext.tsx
# - Atualizar src/context/AppContext.tsx
# - Criar src/components/ProtectedRoute.tsx
# - Atualizar rotas e páginas
```

---

## 📊 Visão Geral da Arquitetura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│    Frontend     │────────▶│   API Backend   │────────▶│   PostgreSQL    │
│   (React + TS)  │  HTTP   │  (Node.js + TS) │  Prisma │    Database     │
│                 │  JWT    │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Stack Tecnológico

**Backend:**
- Node.js 18+
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation

**Frontend:**
- React 18
- TypeScript
- React Router
- Axios
- Tailwind CSS
- Shadcn/ui

---

## 🗃️ Modelo de Dados Resumido

### Principais Entidades

1. **User** - Gestores/Avaliadores do sistema
   - Autenticação (email/password)
   - Roles: ADMIN, EVALUATOR
   
2. **Employee** - Colaboradores avaliados
   - Tipos: GESTORES, OPERACIONAIS
   - Informações: nome, cargo, departamento
   
3. **Evaluation** - Avaliações realizadas
   - Média ponderada calculada
   - Decisão: MANTER, DESLIGAR, EM_EVOLUCAO
   
4. **EvaluationRating** - Notas de cada critério
   - Rating: 0 a 10
   - Weight: peso do critério em %

---

## 🔐 Autenticação

### Login
```bash
POST /api/auth/login
{
  "email": "admin@empresa.com",
  "password": "admin123"
}
```

### Usar Token
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Principais Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário
- `POST /api/auth/logout` - Logout

### Colaboradores
- `GET /api/employees` - Listar colaboradores
- `POST /api/employees` - Criar colaborador
- `GET /api/employees/:id` - Obter detalhes
- `PUT /api/employees/:id` - Atualizar
- `DELETE /api/employees/:id` - Desativar

### Avaliações
- `GET /api/evaluations` - Listar avaliações
- `POST /api/evaluations` - Criar avaliação
- `GET /api/evaluations/:id` - Obter detalhes
- `PUT /api/evaluations/:id` - Atualizar
- `DELETE /api/evaluations/:id` - Remover

### Estatísticas
- `GET /api/stats/dashboard` - Dashboard geral
- `GET /api/stats/employee/:id` - Histórico do colaborador

---

## 🎯 Critérios de Avaliação

### Gestores (28 critérios)
- **Execução e Processos** (30%): 6 critérios
- **Liderança** (25%): 7 critérios
- **Postura** (20%): 9 critérios
- **Resultados** (25%): 6 critérios

### Operacionais (18 critérios)
- **Execução** (32%): 5 critérios
- **Comportamento** (28%): 7 critérios
- **Resultado/Entrega** (30%): 3 critérios
- **Capacidade** (10%): 3 critérios

### Escala de Notas
- **0 a 5.00**: Ruim
- **5.01 a 7.99**: Regular
- **8.00 a 8.99**: Bom
- **9.00 a 10.00**: Excelente

---

## 🔒 Segurança Implementada

✅ JWT Authentication com expiração  
✅ RBAC (Role-Based Access Control)  
✅ Rate Limiting (100 req/15min)  
✅ Helmet.js para headers seguros  
✅ CORS configurado  
✅ Validação de entrada (Zod)  
✅ Password hashing (bcrypt)  
✅ SQL Injection protection (Prisma)  
✅ Audit logs  

---

## 📈 Roadmap de Implementação

### Fase 1: Setup e Autenticação (1 semana)
Setup do projeto + autenticação JWT

### Fase 2: CRUD Colaboradores (1 semana)
Endpoints de colaboradores + validações

### Fase 3: Sistema de Avaliações (2 semanas)
Avaliações + cálculo ponderado + ratings

### Fase 4: Estatísticas (1 semana)
Dashboard + relatórios

### Fase 5: Segurança (1 semana)
Rate limiting + logs + documentação

### Fase 6: Deploy (1 semana)
Docker + CI/CD + monitoramento

**Total estimado: 7 semanas**

---

## 🧪 Testes

### Essenciais
- [ ] Autenticação (login válido/inválido)
- [ ] Autorização (RBAC)
- [ ] CRUD de colaboradores
- [ ] Criação de avaliação completa
- [ ] Cálculo de média ponderada
- [ ] Filtros e paginação
- [ ] Validações de entrada
- [ ] Tratamento de erros

---

## 📦 Credenciais de Teste (após seed)

**Admin:**
- Email: `admin@empresa.com`
- Senha: `admin123`

**Gestor:**
- Email: `gestor@empresa.com`
- Senha: `gestor123`

---

## 🐳 Docker (Opcional)

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: avaliacao_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
```

```bash
docker-compose up -d
```

---

## 📞 Suporte

Para dúvidas sobre implementação:
1. Consulte os documentos detalhados
2. Verifique os exemplos de código
3. Consulte a documentação Swagger (após implementar)

---

## 📌 Próximos Passos

1. ✅ Ler o **ESCOPO_API_BACKEND.md** completo
2. ✅ Seguir os exemplos do **EXEMPLOS_IMPLEMENTACAO_API.md**
3. ✅ Implementar backend seguindo o roadmap
4. ✅ Testar endpoints com Postman/Insomnia
5. ✅ Integrar frontend conforme **INTEGRACAO_FRONTEND.md**
6. ✅ Realizar testes de integração
7. ✅ Deploy

---

**Boa implementação! 🚀**

**Versão**: 1.0  
**Data**: 20/04/2026
