# Arquitetura Visual - Sistema de Avaliação 180°

## 📐 Diagramas e Fluxos do Sistema

---

## 1. Arquitetura Geral

```
┌────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE APRESENTAÇÃO                     │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Login      │  │   Dashboard  │  │   Avaliação  │           │
│  │   Page       │  │   Page       │  │   Page       │  ...      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                  │                    │
│         └──────────────────┴──────────────────┘                   │
│                            │                                       │
│                  ┌─────────▼─────────┐                           │
│                  │   React Router    │                           │
│                  └─────────┬─────────┘                           │
│                            │                                       │
└────────────────────────────┼───────────────────────────────────────┘
                             │
┌────────────────────────────┼───────────────────────────────────────┐
│                  CAMADA DE CONTEXTO                                │
│                            │                                       │
│         ┌──────────────────┴──────────────────┐                  │
│         │                                      │                  │
│  ┌──────▼────────┐                   ┌────────▼────────┐         │
│  │  AuthContext  │                   │   AppContext    │         │
│  │  - login()    │                   │   - employees   │         │
│  │  - logout()   │                   │   - evaluations │         │
│  │  - user       │                   │   - CRUD ops    │         │
│  └───────┬───────┘                   └────────┬────────┘         │
│          │                                     │                  │
└──────────┼─────────────────────────────────────┼──────────────────┘
           │                                     │
┌──────────┼─────────────────────────────────────┼──────────────────┐
│          │         CAMADA DE SERVIÇOS          │                  │
│          │                                     │                  │
│  ┌───────▼─────────┐  ┌──────────────┐  ┌────▼──────────┐       │
│  │  authService    │  │ employeeServ │  │evaluationServ │       │
│  │  - login()      │  │ - getAll()   │  │ - create()    │       │
│  │  - logout()     │  │ - create()   │  │ - getById()   │       │
│  └───────┬─────────┘  └──────┬───────┘  └────┬──────────┘       │
│          │                    │                │                  │
│          └────────────────────┴────────────────┘                  │
│                               │                                   │
│                      ┌────────▼────────┐                         │
│                      │   Axios Client  │                         │
│                      │   (api.ts)      │                         │
│                      └────────┬────────┘                         │
│                               │                                   │
└───────────────────────────────┼───────────────────────────────────┘
                                │ HTTP/REST + JWT
════════════════════════════════╪═══════════════════════════════════
                                │
┌───────────────────────────────┼───────────────────────────────────┐
│                      API BACKEND                                  │
│                               │                                   │
│                      ┌────────▼────────┐                         │
│                      │  Express App    │                         │
│                      │  app.ts         │                         │
│                      └────────┬────────┘                         │
│                               │                                   │
│          ┌────────────────────┼────────────────────┐             │
│          │                    │                    │             │
│  ┌───────▼─────┐    ┌─────────▼──────┐   ┌───────▼──────┐      │
│  │Middlewares  │    │    Routes      │   │ Controllers  │      │
│  │- auth       │───▶│ - /auth        │──▶│ - Auth       │      │
│  │- validation │    │ - /employees   │   │ - Employee   │      │
│  │- RBAC       │    │ - /evaluations │   │ - Evaluation │      │
│  └─────────────┘    └────────────────┘   └───────┬──────┘      │
│                                                    │             │
│                                           ┌────────▼────────┐   │
│                                           │    Services     │   │
│                                           │ - Business      │   │
│                                           │   Logic         │   │
│                                           └────────┬────────┘   │
│                                                    │             │
│                                           ┌────────▼────────┐   │
│                                           │  Prisma Client  │   │
│                                           └────────┬────────┘   │
│                                                    │             │
└────────────────────────────────────────────────────┼─────────────┘
                                                     │ SQL
┌────────────────────────────────────────────────────┼─────────────┐
│                      DATABASE                      │             │
│                                           ┌────────▼────────┐   │
│                                           │   PostgreSQL    │   │
│                                           │                 │   │
│                                           │  - users        │   │
│                                           │  - employees    │   │
│                                           │  - evaluations  │   │
│                                           │  - ratings      │   │
│                                           │  - audit_logs   │   │
│                                           └─────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Fluxo de Autenticação

```
┌─────────┐                ┌──────────┐              ┌──────────┐              ┌──────────┐
│ Usuario │                │ Frontend │              │   API    │              │    DB    │
└────┬────┘                └────┬─────┘              └────┬─────┘              └────┬─────┘
     │                          │                         │                         │
     │ 1. Acessa /login         │                         │                         │
     ├─────────────────────────▶│                         │                         │
     │                          │                         │                         │
     │ 2. Preenche credenciais  │                         │                         │
     ├─────────────────────────▶│                         │                         │
     │                          │                         │                         │
     │                          │ 3. POST /auth/login     │                         │
     │                          ├────────────────────────▶│                         │
     │                          │   {email, password}     │                         │
     │                          │                         │                         │
     │                          │                         │ 4. SELECT user          │
     │                          │                         ├────────────────────────▶│
     │                          │                         │    WHERE email = ?      │
     │                          │                         │                         │
     │                          │                         │ 5. User data            │
     │                          │                         │◀────────────────────────┤
     │                          │                         │                         │
     │                          │                         │ 6. bcrypt.compare()     │
     │                          │                         │    (password)           │
     │                          │                         │                         │
     │                          │                         │ 7. jwt.sign()           │
     │                          │                         │    (generate token)     │
     │                          │                         │                         │
     │                          │ 8. Response             │                         │
     │                          │◀────────────────────────┤                         │
     │                          │   {user, token}         │                         │
     │                          │                         │                         │
     │                          │ 9. Save to localStorage │                         │
     │                          │    - auth_token         │                         │
     │                          │    - user               │                         │
     │                          │                         │                         │
     │ 10. Redirect to /        │                         │                         │
     │◀─────────────────────────┤                         │                         │
     │                          │                         │                         │
     │ 11. Todas requisições    │                         │                         │
     │     incluem header:      │                         │                         │
     │     Authorization: Bearer {token}                  │                         │
     │                          │                         │                         │
```

---

## 3. Fluxo de Criação de Avaliação

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Usuario │     │ Frontend │     │   API    │     │ Service  │     │    DB    │
└────┬────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │                │                │                │
     │ 1. Acessa     │                │                │                │
     │ /evaluation   │                │                │                │
     ├──────────────▶│                │                │                │
     │               │                │                │                │
     │               │ 2. GET /employees/:id           │                │
     │               ├───────────────▶│                │                │
     │               │                │                │                │
     │               │                │ 3. SELECT employee              │
     │               │                │                ├───────────────▶│
     │               │                │                │                │
     │               │ 4. Employee data                │                │
     │               │◀────────────────────────────────┤                │
     │               │                │                │                │
     │ 5. Preenche   │                │                │                │
     │ todos os      │                │                │                │
     │ critérios     │                │                │                │
     ├──────────────▶│                │                │                │
     │               │                │                │                │
     │               │ 6. Calcula média ponderada      │                │
     │               │    (frontend preview)           │                │
     │               │                │                │                │
     │ 7. Salvar     │                │                │                │
     ├──────────────▶│                │                │                │
     │               │                │                │                │
     │               │ 8. POST /evaluations            │                │
     │               ├───────────────▶│                │                │
     │               │  {employeeId,  │                │                │
     │               │   type,        │                │                │
     │               │   decision,    │                │                │
     │               │   ratings[]}   │                │                │
     │               │                │                │                │
     │               │                │ 9. Validate data               │
     │               │                │    (Zod schema)│                │
     │               │                │                │                │
     │               │                │ 10. Create     │                │
     │               │                │    evaluation  │                │
     │               │                ├───────────────▶│                │
     │               │                │                │                │
     │               │                │                │ 11. BEGIN TX  │
     │               │                │                ├───────────────▶│
     │               │                │                │                │
     │               │                │                │ 12. INSERT    │
     │               │                │                │    evaluation │
     │               │                │                ├───────────────▶│
     │               │                │                │                │
     │               │                │                │ 13. INSERT    │
     │               │                │                │    ratings[]  │
     │               │                │                ├───────────────▶│
     │               │                │                │    (bulk)     │
     │               │                │                │                │
     │               │                │                │ 14. COMMIT TX │
     │               │                │                ├───────────────▶│
     │               │                │                │                │
     │               │                │ 15. Return     │                │
     │               │                │    evaluation  │                │
     │               │                │◀───────────────┤                │
     │               │                │                │                │
     │               │ 16. Response   │                │                │
     │               │◀───────────────┤                │                │
     │               │  {evaluation}  │                │                │
     │               │                │                │                │
     │ 17. Success   │                │                │                │
     │    message +  │                │                │                │
     │    redirect   │                │                │                │
     │◀──────────────┤                │                │                │
     │               │                │                │                │
```

---

## 4. Modelo de Dados - Relacionamentos

```
┌─────────────────────────────────────────────────────────────────┐
│                           users                                 │
├─────────────────────────────────────────────────────────────────┤
│ id           UUID    PK                                         │
│ email        VARCHAR UNIQUE                                     │
│ password     VARCHAR                                            │
│ name         VARCHAR                                            │
│ role         ENUM (ADMIN, EVALUATOR)                           │
│ isActive     BOOLEAN                                            │
│ createdAt    TIMESTAMP                                          │
│ updatedAt    TIMESTAMP                                          │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 1:N (evaluations.evaluatorId)
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        evaluations                              │
├─────────────────────────────────────────────────────────────────┤
│ id               UUID    PK                                     │
│ employeeId       UUID    FK ──────────┐                        │
│ evaluatorId      UUID    FK           │                        │
│ type             ENUM                  │                        │
│ average          FLOAT                 │                        │
│ decision         ENUM                  │                        │
│ justification    TEXT                  │                        │
│ createdAt        TIMESTAMP             │                        │
│ updatedAt        TIMESTAMP             │                        │
└──────────┬──────────────────────────────┼────────────────────────┘
           │                              │
           │ 1:N (ratings)                │
           │                              │
           ▼                              │
┌─────────────────────────────────┐      │
│     evaluation_ratings          │      │
├─────────────────────────────────┤      │
│ id             UUID    PK       │      │
│ evaluationId   UUID    FK       │      │
│ criterionId    VARCHAR          │      │
│ criterionName  VARCHAR          │      │
│ category       VARCHAR          │      │
│ weight         FLOAT            │      │
│ rating         FLOAT            │      │
│ createdAt      TIMESTAMP        │      │
└─────────────────────────────────┘      │
                                         │
                                         │ N:1
                                         │
                                         ▼
                              ┌─────────────────────────────┐
                              │       employees             │
                              ├─────────────────────────────┤
                              │ id           UUID    PK     │
                              │ name         VARCHAR        │
                              │ email        VARCHAR UNIQUE │
                              │ position     VARCHAR        │
                              │ department   VARCHAR        │
                              │ type         ENUM           │
                              │ managerId    UUID           │
                              │ isActive     BOOLEAN        │
                              │ hireDate     TIMESTAMP      │
                              │ createdAt    TIMESTAMP      │
                              │ updatedAt    TIMESTAMP      │
                              └─────────────────────────────┘
```

---

## 5. Fluxo de Cálculo da Média Ponderada

```
Avaliação de GESTOR (exemplo com 3 critérios):

┌──────────────────────────────────────────────────────────────┐
│  CRITÉRIO                    PESO    NOTA    PONTOS          │
├──────────────────────────────────────────────────────────────┤
│  Planejamento                 5%     9.5     9.5 × 5 = 47.5  │
│  Execução                     6%     8.5     8.5 × 6 = 51.0  │
│  Controle                     6%     9.0     9.0 × 6 = 54.0  │
├──────────────────────────────────────────────────────────────┤
│  TOTAL                       17%            152.5            │
└──────────────────────────────────────────────────────────────┘

Fórmula:
    Σ(nota × peso)     152.5
    ──────────────  =  ─────  = 8.97
       Σ(peso)          17

Resultado: 8.97 → Classificação: BOM (8.00 a 8.99)


┌────────────────────────────────────────┐
│      CLASSIFICAÇÃO POR FAIXA          │
├────────────────────────────────────────┤
│  0.00 - 5.00  │  RUIM      │  🔴      │
│  5.01 - 7.99  │  REGULAR   │  🟠      │
│  8.00 - 8.99  │  BOM       │  🔵      │
│  9.00 - 10.00 │  EXCELENTE │  🟢      │
└────────────────────────────────────────┘
```

---

## 6. Estrutura de Diretórios - Backend

```
backend/
│
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma client
│   │   ├── jwt.ts               # JWT config
│   │   └── env.ts               # Env variables
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── employees.controller.ts
│   │   └── evaluations.controller.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # JWT verification
│   │   ├── validation.middleware.ts  # Zod validation
│   │   ├── error.middleware.ts       # Error handler
│   │   └── rbac.middleware.ts        # Role-based access
│   │
│   ├── models/                   # Types/Interfaces
│   │   ├── user.model.ts
│   │   ├── employee.model.ts
│   │   └── evaluation.model.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── employees.routes.ts
│   │   └── evaluations.routes.ts
│   │
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── employees.service.ts
│   │   └── evaluations.service.ts
│   │
│   ├── utils/
│   │   ├── hash.ts              # bcrypt
│   │   ├── jwt.ts               # JWT utils
│   │   ├── validators.ts        # Zod schemas
│   │   └── calculations.ts      # Média ponderada
│   │
│   ├── types/
│   │   └── index.ts             # Global types
│   │
│   └── app.ts                   # Express app
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # DB migrations
│   └── seed.ts                  # Initial data
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env                         # Environment vars
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 7. Estrutura de Diretórios - Frontend

```
src/
│
├── app/
│   ├── components/
│   │   ├── ui/                      # Shadcn components
│   │   ├── Layout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── AddEmployeeDialog.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx          # 🔐 Auth state
│   │   └── AppContext.tsx           # 📊 App state
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx                # 🔐 Login page
│   │   ├── Dashboard.tsx
│   │   ├── Employees.tsx
│   │   ├── Evaluation.tsx           # ⭐ Main evaluation
│   │   ├── Management.tsx
│   │   └── EvaluationDetails.tsx
│   │
│   └── App.tsx                      # Routes
│
├── lib/
│   ├── api.ts                       # 🌐 Axios client
│   └── error-handler.ts             # Error handling
│
├── services/
│   ├── auth.service.ts              # 🔐 Auth API calls
│   ├── employee.service.ts          # 👥 Employee API
│   └── evaluation.service.ts        # ⭐ Evaluation API
│
└── styles/
    ├── fonts.css
    └── theme.css
```

---

## 8. Fluxo Completo - Da Tela ao Banco

```
┌────────────────────────────────────────────────────────────────────┐
│  1. FRONTEND - Página de Avaliação                                │
│     /evaluation/:type/:id                                          │
│     - Usuário preenche formulário com critérios                   │
│     - Visualiza média em tempo real                               │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 2. Submit Form
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  3. FRONTEND - Evaluation Page Component                          │
│     handleSubmit()                                                 │
│     - Valida campos obrigatórios                                  │
│     - Prepara objeto de dados                                      │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 4. Call Service
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  5. FRONTEND - evaluationService.create()                         │
│     - Formata dados para API                                       │
│     - Adiciona token JWT ao header                                │
│     - POST /api/evaluations                                        │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 6. HTTP Request
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  7. BACKEND - Express Middlewares                                 │
│     - helmet (security headers)                                    │
│     - cors (allow frontend)                                        │
│     - rate limiter (100 req/15min)                                │
│     - body parser                                                  │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 8. Route Match
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  9. BACKEND - POST /api/evaluations Route                         │
│     - authenticate middleware (verify JWT)                         │
│     - validate middleware (Zod schema)                            │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 10. Call Controller
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  11. BACKEND - EvaluationController.create()                      │
│      - Extract data from req.body                                  │
│      - Get userId from req.user (JWT payload)                     │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 12. Call Service
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  13. BACKEND - EvaluationService.create()                         │
│      - Validate employee exists                                    │
│      - Validate employee type matches                             │
│      - Calculate weighted average                                 │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 14. Database Transaction
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  15. BACKEND - Prisma ORM                                         │
│      BEGIN TRANSACTION;                                            │
│                                                                    │
│      INSERT INTO evaluations (...)                                │
│      VALUES (uuid, employeeId, evaluatorId, ...);                 │
│                                                                    │
│      INSERT INTO evaluation_ratings (...)                         │
│      VALUES                                                        │
│        (uuid, evaluationId, 'exec1', 'Planejamento', 5, 9.5),    │
│        (uuid, evaluationId, 'exec2', 'Execução', 6, 8.5),        │
│        ... [bulk insert all ratings];                             │
│                                                                    │
│      COMMIT;                                                       │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 16. Return Data
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  17. BACKEND - Response                                           │
│      {                                                             │
│        success: true,                                             │
│        data: {                                                     │
│          id: "uuid",                                              │
│          average: 8.97,                                           │
│          ...                                                       │
│        }                                                           │
│      }                                                             │
└────────────┬───────────────────────────────────────────────────────┘
             │
             │ 18. HTTP Response
             ▼
┌────────────────────────────────────────────────────────────────────┐
│  19. FRONTEND - Success Handler                                   │
│      - Show success toast                                          │
│      - Refresh evaluations list                                   │
│      - Redirect to dashboard                                       │
└────────────────────────────────────────────────────────────────────┘
```

---

## 9. Segurança em Camadas

```
┌──────────────────────────────────────────────────────────────┐
│                    CAMADA 1: REDE                            │
│  - HTTPS (TLS 1.3)                                          │
│  - Rate Limiting (100 req/15min)                            │
│  - CORS (whitelist de origens)                             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              CAMADA 2: AUTENTICAÇÃO                          │
│  - JWT com expiração (24h)                                  │
│  - Tokens em localStorage (frontend)                        │
│  - Middleware de autenticação                               │
│  - Blacklist de tokens (logout)                             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              CAMADA 3: AUTORIZAÇÃO                           │
│  - RBAC (Role-Based Access Control)                         │
│  - Roles: ADMIN, EVALUATOR                                  │
│  - Permissões granulares por recurso                        │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              CAMADA 4: VALIDAÇÃO                             │
│  - Zod schemas                                               │
│  - Validação de tipos                                        │
│  - Sanitização de entrada                                   │
│  - Regras de negócio                                         │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              CAMADA 5: DADOS                                 │
│  - Prisma ORM (proteção SQL Injection)                      │
│  - Transactions ACID                                         │
│  - Bcrypt para senhas (salt rounds: 12)                    │
│  - Audit logs                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Métricas e Monitoramento

```
┌──────────────────────────────────────────────────────────────┐
│                    HEALTH ENDPOINT                           │
│                                                              │
│  GET /health                                                 │
│                                                              │
│  Response:                                                   │
│  {                                                           │
│    "status": "ok",                                          │
│    "timestamp": "2026-04-20T10:00:00Z",                    │
│    "uptime": 3600,                                          │
│    "database": "connected",                                 │
│    "version": "1.0.0"                                       │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    MÉTRICAS IMPORTANTES                      │
├──────────────────────────────────────────────────────────────┤
│  • Response Time (ms)                                        │
│    - Target: < 200ms (p95)                                  │
│    - Alert: > 1000ms                                         │
│                                                              │
│  • Error Rate (%)                                           │
│    - Target: < 1%                                           │
│    - Alert: > 5%                                             │
│                                                              │
│  • Request Rate (req/s)                                     │
│    - Monitor: baseline                                       │
│    - Alert: 10x baseline                                     │
│                                                              │
│  • Database Connections                                      │
│    - Pool size: 20                                          │
│    - Alert: > 18 active                                      │
└──────────────────────────────────────────────────────────────┘
```

---

**Estes diagramas fornecem uma visão completa da arquitetura do sistema!**
