# 📘 Sistema de Avaliação 180° - Documentação Completa da API

> **Documentação técnica completa** para desenvolvimento da API backend e integração com frontend

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Modelo de Dados](#modelo-de-dados)
4. [Endpoints da API](#endpoints-da-api)
5. [Autenticação e Segurança](#autenticação-e-segurança)
6. [Exemplos de Implementação](#exemplos-de-implementação)
7. [Integração Frontend](#integração-frontend)
8. [Deploy e Ambiente](#deploy-e-ambiente)
9. [Roadmap de Implementação](#roadmap-de-implementação)

---

# Visão Geral

## Objetivo do Projeto

Sistema web de avaliação de colaboradores utilizando o método 180 graus, destinado a gestores para avaliar tanto gestores quanto operacionais, com autenticação segura e persistência de dados em banco PostgreSQL.

## Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL 15+
- **ORM**: Prisma
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Zod
- **Segurança**: Helmet, CORS, Rate Limiting
- **Documentação**: Swagger/OpenAPI 3.0

### Frontend (Atual)
- **Framework**: React 18 + TypeScript
- **Routing**: React Router
- **HTTP Client**: Axios
- **UI**: Tailwind CSS + Shadcn/ui
- **State**: Context API

## Funcionalidades Principais

✅ Autenticação segura com JWT  
✅ Gerenciamento de colaboradores (CRUD)  
✅ Sistema de avaliações com critérios específicos  
✅ Cálculo automático de média ponderada  
✅ Dashboard com estatísticas  
✅ Controle de acesso baseado em roles (RBAC)  
✅ Histórico de avaliações  
✅ Logs de auditoria  

---

# Arquitetura do Sistema

## Diagrama de Arquitetura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│    Frontend     │────────▶│   API Backend   │────────▶│   PostgreSQL    │
│   (React + TS)  │  HTTP   │  (Node.js + TS) │  Prisma │    Database     │
│                 │  JWT    │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Camadas da Aplicação

### 1. Camada de Apresentação (Frontend)
- Páginas React
- Componentes UI
- Contexts (Auth, App)
- Services (API calls)

### 2. Camada de API (Backend)
- **Routes**: Definição de endpoints
- **Middlewares**: Auth, Validation, RBAC, Error Handling
- **Controllers**: Processamento de requisições
- **Services**: Lógica de negócio
- **Utils**: Funções auxiliares

### 3. Camada de Dados
- **Prisma ORM**: Abstração do banco
- **PostgreSQL**: Persistência
- **Migrations**: Versionamento do schema

---

# Modelo de Dados

## Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// USUÁRIOS DO SISTEMA (Gestores/Avaliadores)
// ==========================================

model User {
  id           String       @id @default(uuid())
  email        String       @unique
  password     String
  name         String
  role         UserRole     @default(EVALUATOR)
  isActive     Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  evaluations  Evaluation[]
  
  @@map("users")
}

enum UserRole {
  ADMIN
  EVALUATOR
}

// ==========================================
// COLABORADORES (Que serão avaliados)
// ==========================================

model Employee {
  id           String          @id @default(uuid())
  name         String
  email        String?         @unique
  position     String
  department   String
  type         EmployeeType
  managerId    String?
  isActive     Boolean         @default(true)
  hireDate     DateTime?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  
  evaluations  Evaluation[]
  
  @@map("employees")
  @@index([type])
  @@index([email])
}

enum EmployeeType {
  GESTORES
  OPERACIONAIS
}

// ==========================================
// AVALIAÇÕES
// ==========================================

model Evaluation {
  id                String              @id @default(uuid())
  employeeId        String
  employee          Employee            @relation(fields: [employeeId], references: [id])
  evaluatorId       String
  evaluator         User                @relation(fields: [evaluatorId], references: [id])
  type              EmployeeType
  average           Float
  decision          EvaluationDecision
  justification     String              @db.Text
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  ratings           EvaluationRating[]
  
  @@map("evaluations")
  @@index([employeeId])
  @@index([evaluatorId])
  @@index([createdAt])
}

enum EvaluationDecision {
  MANTER
  DESLIGAR
  EM_EVOLUCAO
}

// ==========================================
// NOTAS DE CADA CRITÉRIO
// ==========================================

model EvaluationRating {
  id             String      @id @default(uuid())
  evaluationId   String
  evaluation     Evaluation  @relation(fields: [evaluationId], references: [id], onDelete: Cascade)
  criterionId    String
  criterionName  String
  category       String
  weight         Float
  rating         Float
  createdAt      DateTime    @default(now())
  
  @@map("evaluation_ratings")
  @@index([evaluationId])
}

// ==========================================
// AUDITORIA
// ==========================================

model AuditLog {
  id           String    @id @default(uuid())
  userId       String?
  action       String
  entityType   String
  entityId     String
  changes      Json?
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime  @default(now())
  
  @@map("audit_logs")
  @@index([userId])
  @@index([createdAt])
}
```

## Relacionamentos

```
User (1) ────────── (N) Evaluation
Employee (1) ────── (N) Evaluation
Evaluation (1) ──── (N) EvaluationRating
```

---

# Endpoints da API

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.empresa.com/api
```

## 1. Autenticação

### POST `/auth/login`
Autentica usuário e retorna token JWT

**Request:**
```json
{
  "email": "admin@empresa.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@empresa.com",
      "name": "Administrador",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### GET `/auth/me`
Retorna dados do usuário autenticado

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@empresa.com",
    "name": "Administrador",
    "role": "ADMIN"
  }
}
```

### POST `/auth/logout`
Invalida o token atual

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## 2. Colaboradores

### GET `/employees`
Lista todos os colaboradores

**Query Params:**
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 20, max: 100)
- `type` (opcional): GESTORES | OPERACIONAIS
- `department` (opcional): filtrar por departamento
- `search` (opcional): buscar por nome

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "uuid",
        "name": "Ana Silva Santos",
        "email": "ana.silva@empresa.com",
        "position": "Gerente de Vendas",
        "department": "Comercial",
        "type": "GESTORES",
        "isActive": true,
        "evaluationsCount": 3,
        "lastEvaluationDate": "2026-03-15T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

### GET `/employees/:id`
Obtém detalhes de um colaborador

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ana Silva Santos",
    "email": "ana.silva@empresa.com",
    "position": "Gerente de Vendas",
    "department": "Comercial",
    "type": "GESTORES",
    "hireDate": "2020-01-15T00:00:00Z",
    "evaluations": [
      {
        "id": "uuid",
        "average": 8.5,
        "decision": "MANTER",
        "createdAt": "2026-03-15T00:00:00Z"
      }
    ]
  }
}
```

### POST `/employees`
Cria novo colaborador

**Request:**
```json
{
  "name": "Carlos Souza",
  "email": "carlos.souza@empresa.com",
  "position": "Analista de TI",
  "department": "Tecnologia",
  "type": "OPERACIONAIS",
  "managerId": "uuid-do-gestor",
  "hireDate": "2026-04-01"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos Souza",
    "email": "carlos.souza@empresa.com",
    "position": "Analista de TI",
    "department": "Tecnologia",
    "type": "OPERACIONAIS"
  }
}
```

### PUT `/employees/:id`
Atualiza colaborador

### DELETE `/employees/:id`
Desativa colaborador (soft delete)

### GET `/employees/pending`
Lista colaboradores sem avaliação

---

## 3. Avaliações

### POST `/evaluations`
Cria nova avaliação

**Request:**
```json
{
  "employeeId": "uuid",
  "type": "GESTORES",
  "decision": "MANTER",
  "justification": "Excelente desempenho em todas as áreas...",
  "ratings": [
    {
      "criterionId": "exec1",
      "criterionName": "Planejamento",
      "category": "Execução e Processos",
      "weight": 5,
      "rating": 9.5
    },
    {
      "criterionId": "exec2",
      "criterionName": "Execução",
      "category": "Execução e Processos",
      "weight": 6,
      "rating": 8.5
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "evaluatorId": "uuid",
    "type": "GESTORES",
    "average": 8.97,
    "decision": "MANTER",
    "createdAt": "2026-04-20T14:30:00Z"
  }
}
```

### GET `/evaluations`
Lista todas as avaliações

**Query Params:**
- `page`, `limit`: paginação
- `employeeId`: filtrar por colaborador
- `evaluatorId`: filtrar por avaliador
- `type`: GESTORES | OPERACIONAIS
- `decision`: MANTER | DESLIGAR | EM_EVOLUCAO

### GET `/evaluations/:id`
Obtém detalhes completos de uma avaliação

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee": {
      "id": "uuid",
      "name": "Ana Silva Santos",
      "position": "Gerente de Vendas"
    },
    "evaluator": {
      "id": "uuid",
      "name": "João Diretor"
    },
    "type": "GESTORES",
    "average": 8.5,
    "decision": "MANTER",
    "justification": "Excelente desempenho...",
    "ratings": [
      {
        "criterionId": "exec1",
        "criterionName": "Planejamento",
        "category": "Execução e Processos",
        "weight": 5,
        "rating": 9.5
      }
    ]
  }
}
```

---

## 4. Estatísticas

### GET `/stats/dashboard`
Estatísticas gerais

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 150,
    "totalEvaluations": 320,
    "pendingEvaluations": 25,
    "byDecision": {
      "MANTER": 280,
      "DESLIGAR": 15,
      "EM_EVOLUCAO": 25
    },
    "averageScore": 8.2,
    "byType": {
      "GESTORES": {
        "total": 50,
        "evaluated": 45,
        "averageScore": 8.5
      },
      "OPERACIONAIS": {
        "total": 100,
        "evaluated": 85,
        "averageScore": 8.0
      }
    }
  }
}
```

---

# Autenticação e Segurança

## Autenticação JWT

### Geração de Token
```typescript
// Payload do token
{
  userId: "uuid",
  email: "usuario@empresa.com",
  role: "ADMIN"
}

// Expiração: 24 horas
```

### Uso do Token
Todas as requisições autenticadas devem incluir:
```
Authorization: Bearer {token}
```

## Controle de Acesso (RBAC)

### Roles Disponíveis

**ADMIN:**
- Gerenciar usuários ✅
- Gerenciar colaboradores ✅
- Criar/visualizar/editar/deletar avaliações ✅
- Visualizar estatísticas ✅

**EVALUATOR:**
- Visualizar usuários ❌
- Gerenciar colaboradores ✅
- Criar avaliações ✅
- Visualizar apenas próprias avaliações ✅
- Editar avaliações (24h após criação) ✅
- Visualizar estatísticas ✅

## Segurança Implementada

✅ **Rate Limiting**: 100 requisições por IP a cada 15 minutos  
✅ **Helmet.js**: Headers de segurança HTTP  
✅ **CORS**: Whitelist de origens permitidas  
✅ **Validação**: Zod schemas em todos endpoints  
✅ **Password Hashing**: bcrypt com 12 salt rounds  
✅ **SQL Injection**: Proteção via Prisma ORM  
✅ **Audit Logs**: Registro de ações críticas  

---

# Exemplos de Implementação

## Setup Inicial

### 1. Criar Projeto Backend

```bash
mkdir backend
cd backend
npm init -y

# Instalar dependências
npm install express prisma @prisma/client bcryptjs jsonwebtoken zod dotenv helmet cors express-rate-limit

# Dev dependencies
npm install -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken tsx nodemon
```

### 2. Configurar TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### 3. Inicializar Prisma

```bash
npx prisma init
```

Copiar o schema completo para `prisma/schema.prisma`

### 4. Configurar Variáveis de Ambiente

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/avaliacao_db"
JWT_SECRET="sua-chave-secreta-super-forte-aqui"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

## Código de Exemplo

### Middleware de Autenticação

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Token não fornecido',
        },
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Token inválido ou expirado',
      },
    });
  }
};
```

### Service de Avaliação

```typescript
// src/services/evaluation.service.ts
import prisma from '../config/database';
import { calculateWeightedAverage } from '../utils/calculations';

export class EvaluationService {
  async create(data: CreateEvaluationData) {
    // Verificar colaborador
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw new Error('Colaborador não encontrado');
    }

    // Calcular média
    const average = calculateWeightedAverage(
      data.ratings.map((r) => ({ rating: r.rating, weight: r.weight }))
    );

    // Criar avaliação
    const evaluation = await prisma.evaluation.create({
      data: {
        employeeId: data.employeeId,
        evaluatorId: data.evaluatorId,
        type: data.type,
        decision: data.decision,
        justification: data.justification,
        average,
        ratings: {
          create: data.ratings,
        },
      },
      include: {
        employee: true,
        evaluator: true,
        ratings: true,
      },
    });

    return evaluation;
  }
}
```

### Cálculo de Média Ponderada

```typescript
// src/utils/calculations.ts
interface Rating {
  rating: number;
  weight: number;
}

export const calculateWeightedAverage = (ratings: Rating[]): number => {
  if (ratings.length === 0) return 0;

  const totalWeightedScore = ratings.reduce(
    (sum, item) => sum + item.rating * item.weight,
    0
  );
  
  const totalWeight = ratings.reduce((sum, item) => sum + item.weight, 0);
  
  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
};
```

## Seed do Banco

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  // Gestor
  const gestorPassword = await bcrypt.hash('gestor123', 12);
  await prisma.user.upsert({
    where: { email: 'gestor@empresa.com' },
    update: {},
    create: {
      email: 'gestor@empresa.com',
      password: gestorPassword,
      name: 'João Gestor',
      role: 'EVALUATOR',
    },
  });

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

# Integração Frontend

## 1. Instalar Axios

```bash
pnpm add axios
```

## 2. Criar Cliente HTTP

```typescript
// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratar erro 401 (não autenticado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 3. Criar AuthContext

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) setUser(storedUser);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

## 4. Criar Services

```typescript
// src/services/auth.service.ts
import { api } from '../lib/api';

export const authService = {
  async login(credentials: { email: string; password: string }) {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('auth_token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data.data;
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
```

```typescript
// src/services/evaluation.service.ts
import { api } from '../lib/api';

export const evaluationService = {
  async create(data: CreateEvaluationData) {
    const response = await api.post('/evaluations', data);
    return response.data.data;
  },

  async getAll(filters?: any) {
    const response = await api.get('/evaluations', { params: filters });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get(`/evaluations/${id}`);
    return response.data.data;
  },
};
```

## 5. Proteger Rotas

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

---

# Deploy e Ambiente

## Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/avaliacao_db
      - JWT_SECRET=${JWT_SECRET}
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
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Migrations
npx prisma migrate dev --name init
npx prisma generate

# Seed
npx prisma db seed

# Build
npm run build

# Produção
npm start

# Prisma Studio
npx prisma studio
```

---

# Roadmap de Implementação

## Fase 1: Setup e Autenticação (1 semana)
- [ ] Setup do projeto (Node.js + Express + Prisma)
- [ ] Configuração do PostgreSQL
- [ ] Schema do Prisma
- [ ] Sistema de autenticação JWT
- [ ] Middleware de autorização RBAC
- [ ] Seed inicial (usuário admin)

## Fase 2: CRUD Colaboradores (1 semana)
- [ ] Endpoints de colaboradores
- [ ] Validações de negócio
- [ ] Filtros e paginação
- [ ] Testes unitários

## Fase 3: Sistema de Avaliações (2 semanas)
- [ ] Endpoints de avaliações
- [ ] Cálculo de média ponderada
- [ ] Validação de critérios por tipo
- [ ] Relacionamento com ratings
- [ ] Regras de edição/exclusão

## Fase 4: Estatísticas (1 semana)
- [ ] Endpoint de dashboard
- [ ] Histórico de colaboradores
- [ ] Relatórios por período

## Fase 5: Segurança e Documentação (1 semana)
- [ ] Rate limiting
- [ ] CORS configurado
- [ ] Logs de auditoria
- [ ] Documentação Swagger
- [ ] Testes E2E

## Fase 6: Deploy (1 semana)
- [ ] Containerização (Docker)
- [ ] CI/CD pipeline
- [ ] Monitoramento
- [ ] Backup do banco

**Total Estimado: 7 semanas**

---

# Critérios de Avaliação

## Gestores (28 critérios)

### A) Execução e Processos (30%)
1. Planejamento (5%) – Organiza e prioriza as atividades do dia a dia
2. Execução (6%) – Cumpre prazos e o planejado
3. Controle (6%) – Acompanha, cobra e ajusta as atividades
4. Processos (4%) – Segue e garante os padrões definidos
5. Segurança (EPI) (4%) – Cumpre e cobra o uso correto de EPIs
6. Capricho (5%) – Atua com atenção aos detalhes e qualidade

### B) Liderança (25%)
1. Gestão da equipe (5%) – Orienta, acompanha e desenvolve o time
2. Feedback / Correção (4%) – Corrige e elogia quando necessário
3. União da equipe (3%) – Mantém o time alinhado e engajado
4. Comunicação (4%) – Se comunica com clareza e escuta a equipe
5. Delegação (3%) – Distribui e acompanha as atividades
6. Backup (Sucessão) (3%) – Prepara substitutos e garante continuidade
7. Tratamento de Conflitos (3%) – Resolve problemas antes de piorarem

### C) Postura (20%)
1. Responsabilidade (3%) – Cumpre compromissos e assume resultados
2. Confiança (2%) – Age com ética, transparência e coerência
3. Mentalidade de Dono (3%) – Busca o melhor resultado com menor custo
4. Equilíbrio emocional (2%) – Lida com pressão sem repassar para equipe
5. Humildade (2%) – Reconhece erros e busca melhorar
6. Desenvolvimento pessoal (2%) – Busca aprendizado contínuo
7. Iniciativa (2%) – Age sem precisar ser cobrado
8. Visão Estratégica (2%) – Entende impacto das ações nos resultados
9. Relacionamento (2%) – Mantém boa convivência

### D) Resultados (25%)
1. Qualidade (5%) – Entrega dentro do padrão esperado
2. Resultado da área (7%) – Atinge metas e objetivos
3. Capacidade analítica (4%) – Analisa e resolve problemas
4. Visão financeira (3%) – Evita desperdícios e se preocupa com custos
5. Melhoria contínua (3%) – Busca fazer melhor, mais rápido
6. Capacidade de negociação (3%) – Alinha prazos e entregas

## Operacionais (18 critérios)

### A) Execução (32%)
1. Qualidade (12%) – Entrega o trabalho bem-feito, sem erros
2. Atenção (3%) – Presta atenção no que foi solicitado
3. Processos (8%) – Executa conforme processos definidos
4. Segurança (EPI) (4%) – Utiliza corretamente os EPIs
5. Capricho (5%) – Realiza trabalho com cuidado e zelo

### B) Comportamento (28%)
1. Disciplina (4%) – Cumpre horários e regras da empresa
2. Relacionamento (2%) – Trabalha bem com equipe e liderança
3. Comunicação (2%) – Entende e transmite informações com clareza
4. Equilíbrio (5%) – Mantém controle emocional sob pressão
5. Iniciativa (5%) – Age sem precisar ser solicitado
6. Vontade de aprender (5%) – Demonstra interesse em evoluir
7. Interesse pela empresa (5%) – Se preocupa com resultados

### C) Resultado/Entrega (30%)
1. Produtividade (12%) – Entrega no prazo ou acima do esperado
2. Comprometimento (10%) – Cumpre combinado e assume responsabilidades
3. Cuidado com equipamentos (8%) – Zela por máquinas e ferramentas

### D) Capacidade (10%)
1. Conhecimento da atividade (4%) – Domina o trabalho que executa
2. Tomada de decisão (3%) – Resolve problemas com autonomia
3. Sugestão de melhoria (3%) – Propõe ideias para melhoria

## Escala de Classificação

| Nota | Classificação | Cor |
|------|---------------|-----|
| 0.00 - 5.00 | Ruim | 🔴 |
| 5.01 - 7.99 | Regular | 🟠 |
| 8.00 - 8.99 | Bom | 🔵 |
| 9.00 - 10.00 | Excelente | 🟢 |

---

# Checklist de Implementação

## Backend
- [ ] Projeto Node.js criado
- [ ] Prisma configurado
- [ ] Database PostgreSQL configurado
- [ ] Schema criado e migrado
- [ ] Seed executado
- [ ] Middlewares implementados
- [ ] Services implementados
- [ ] Controllers implementados
- [ ] Routes configuradas
- [ ] Testes básicos
- [ ] API rodando

## Frontend
- [ ] Axios instalado
- [ ] Cliente HTTP configurado
- [ ] Services criados
- [ ] AuthContext implementado
- [ ] AppContext atualizado
- [ ] Login integrado
- [ ] Rotas protegidas
- [ ] CRUD funcionando
- [ ] Avaliações funcionando
- [ ] Testes de integração

## Deploy
- [ ] Dockerfile criado
- [ ] Docker Compose configurado
- [ ] Variáveis de ambiente configuradas
- [ ] CI/CD configurado
- [ ] Monitoramento configurado
- [ ] Backup configurado

---

# Recursos Adicionais

## Credenciais de Teste
Após executar o seed:

**Admin:**
- Email: `admin@empresa.com`
- Senha: `admin123`

**Gestor/Avaliador:**
- Email: `gestor@empresa.com`
- Senha: `gestor123`

## Links Úteis
- Documentação Prisma: https://www.prisma.io/docs
- Documentação Express: https://expressjs.com
- Documentação JWT: https://jwt.io
- Documentação Zod: https://zod.dev

---

**Versão**: 1.0  
**Data**: 20/04/2026  
**Autor**: Equipe de Desenvolvimento

---

> 📌 **Nota**: Esta documentação foi criada para servir como guia completo de implementação. Para detalhes adicionais sobre fluxos específicos e diagramas visuais, consulte os arquivos:
> - `ARQUITETURA_VISUAL.md` - Diagramas e fluxos detalhados
> - `EXEMPLOS_IMPLEMENTACAO_API.md` - Mais exemplos de código
> - `INTEGRACAO_FRONTEND.md` - Guia completo de integração

**🚀 Bom desenvolvimento!**
