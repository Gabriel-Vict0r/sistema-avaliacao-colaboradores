# Exemplos de Implementação - API Backend

Este documento contém exemplos práticos de código para implementar a API.

---

## 1. Setup Inicial do Projeto

### 1.1 Inicializar Projeto

```bash
# Criar diretório
mkdir backend
cd backend

# Inicializar package.json
npm init -y

# Instalar dependências principais
npm install express prisma @prisma/client
npm install bcryptjs jsonwebtoken zod dotenv
npm install helmet cors express-rate-limit

# Instalar dependências de desenvolvimento
npm install -D typescript @types/node @types/express
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D tsx nodemon prisma
```

### 1.2 TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 1.3 Package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio",
    "test": "jest"
  }
}
```

---

## 2. Configuração do Prisma

### 2.1 Inicializar Prisma

```bash
npx prisma init
```

### 2.2 Schema Completo

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

---

## 3. Configuração e Utilidades

### 3.1 Database Config

```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

### 3.2 JWT Utils

```typescript
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};
```

### 3.3 Hash Utils

```typescript
// src/utils/hash.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
```

### 3.4 Cálculo de Média Ponderada

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

export const getClassification = (average: number): string => {
  if (average <= 5.0) return 'RUIM';
  if (average < 8.0) return 'REGULAR';
  if (average < 9.0) return 'BOM';
  return 'EXCELENTE';
};
```

---

## 4. Middlewares

### 4.1 Auth Middleware

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
          message: 'Token de autenticação não fornecido',
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

### 4.2 RBAC Middleware

```typescript
// src/middlewares/rbac.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'Usuário não autenticado',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_FORBIDDEN',
          message: 'Você não tem permissão para acessar este recurso',
        },
      });
    }

    next();
  };
};
```

### 4.3 Validation Middleware

```typescript
// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: error.errors,
        },
      });
    }
  };
};
```

### 4.4 Error Handler Middleware

```typescript
// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};
```

---

## 5. Schemas de Validação (Zod)

```typescript
// src/schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

// src/schemas/employee.schema.ts
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional(),
  position: z.string().min(2, 'Cargo é obrigatório'),
  department: z.string().min(2, 'Departamento é obrigatório'),
  type: z.enum(['GESTORES', 'OPERACIONAIS']),
  managerId: z.string().uuid().optional(),
  hireDate: z.string().datetime().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// src/schemas/evaluation.schema.ts
import { z } from 'zod';

const ratingSchema = z.object({
  criterionId: z.string(),
  criterionName: z.string(),
  category: z.string(),
  weight: z.number().min(0).max(100),
  rating: z.number().min(0).max(10),
});

export const createEvaluationSchema = z.object({
  employeeId: z.string().uuid('ID do colaborador inválido'),
  type: z.enum(['GESTORES', 'OPERACIONAIS']),
  decision: z.enum(['MANTER', 'DESLIGAR', 'EM_EVOLUCAO']),
  justification: z.string().min(20, 'Justificativa deve ter no mínimo 20 caracteres'),
  ratings: z.array(ratingSchema).min(1, 'Pelo menos um critério deve ser avaliado'),
});
```

---

## 6. Services

### 6.1 Auth Service

```typescript
// src/services/auth.service.ts
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new Error('Usuário inativo');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      expiresIn: '24h',
    };
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: 'ADMIN' | 'EVALUATOR';
  }) {
    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }
}
```

### 6.2 Evaluation Service

```typescript
// src/services/evaluation.service.ts
import prisma from '../config/database';
import { calculateWeightedAverage } from '../utils/calculations';

interface CreateEvaluationData {
  employeeId: string;
  evaluatorId: string;
  type: 'GESTORES' | 'OPERACIONAIS';
  decision: 'MANTER' | 'DESLIGAR' | 'EM_EVOLUCAO';
  justification: string;
  ratings: Array<{
    criterionId: string;
    criterionName: string;
    category: string;
    weight: number;
    rating: number;
  }>;
}

export class EvaluationService {
  async create(data: CreateEvaluationData) {
    // Verificar se colaborador existe
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw new Error('Colaborador não encontrado');
    }

    if (employee.type !== data.type) {
      throw new Error('Tipo de avaliação não corresponde ao tipo do colaborador');
    }

    // Calcular média ponderada
    const average = calculateWeightedAverage(
      data.ratings.map((r) => ({ rating: r.rating, weight: r.weight }))
    );

    // Criar avaliação com ratings
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
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true,
          },
        },
        evaluator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: true,
      },
    });

    return evaluation;
  }

  async findById(id: string) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            department: true,
            type: true,
          },
        },
        evaluator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          orderBy: {
            category: 'asc',
          },
        },
      },
    });

    if (!evaluation) {
      throw new Error('Avaliação não encontrada');
    }

    return evaluation;
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    employeeId?: string;
    evaluatorId?: string;
    type?: 'GESTORES' | 'OPERACIONAIS';
    decision?: string;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.evaluatorId) where.evaluatorId = filters.evaluatorId;
    if (filters.type) where.type = filters.type;
    if (filters.decision) where.decision = filters.decision;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              position: true,
              department: true,
            },
          },
          evaluator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.evaluation.count({ where }),
    ]);

    return {
      evaluations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

---

## 7. Controllers

### 7.1 Auth Controller

```typescript
// src/controllers/auth.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: error.message,
        },
      });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      res.json({
        success: true,
        data: req.user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  }
}
```

### 7.2 Evaluation Controller

```typescript
// src/controllers/evaluation.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { EvaluationService } from '../services/evaluation.service';

const evaluationService = new EvaluationService();

export class EvaluationController {
  async create(req: AuthRequest, res: Response) {
    try {
      const data = {
        ...req.body,
        evaluatorId: req.user!.userId,
      };

      const evaluation = await evaluationService.create(data);

      res.status(201).json({
        success: true,
        data: evaluation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EVALUATION_CREATE_ERROR',
          message: error.message,
        },
      });
    }
  }

  async findById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const evaluation = await evaluationService.findById(id);

      res.json({
        success: true,
        data: evaluation,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EVALUATION_NOT_FOUND',
          message: error.message,
        },
      });
    }
  }

  async findAll(req: AuthRequest, res: Response) {
    try {
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        employeeId: req.query.employeeId as string,
        evaluatorId: req.query.evaluatorId as string,
        type: req.query.type as any,
        decision: req.query.decision as string,
      };

      const result = await evaluationService.findAll(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  }
}
```

---

## 8. Routes

### 8.1 Auth Routes

```typescript
// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
```

### 8.2 Evaluation Routes

```typescript
// src/routes/evaluation.routes.ts
import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createEvaluationSchema } from '../schemas/evaluation.schema';

const router = Router();
const evaluationController = new EvaluationController();

router.use(authenticate); // Todas as rotas requerem autenticação

router.post('/', validate(createEvaluationSchema), evaluationController.create);
router.get('/', evaluationController.findAll);
router.get('/:id', evaluationController.findById);

export default router;
```

---

## 9. App Principal

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import evaluationRoutes from './routes/evaluation.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Tente novamente mais tarde.',
    },
  },
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

---

## 10. Seed Inicial

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // Criar gestor avaliador
  const gestorPassword = await bcrypt.hash('gestor123', 12);
  
  const gestor = await prisma.user.upsert({
    where: { email: 'gestor@empresa.com' },
    update: {},
    create: {
      email: 'gestor@empresa.com',
      password: gestorPassword,
      name: 'João Gestor',
      role: 'EVALUATOR',
    },
  });

  console.log('✅ Gestor criado:', gestor.email);

  // Criar colaboradores de exemplo
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Ana Silva Santos',
        email: 'ana.silva@empresa.com',
        position: 'Gerente de Vendas',
        department: 'Comercial',
        type: 'GESTORES',
      },
    }),
    prisma.employee.create({
      data: {
        name: 'João Pedro Santos',
        email: 'joao.pedro@empresa.com',
        position: 'Operador de Máquinas',
        department: 'Produção',
        type: 'OPERACIONAIS',
      },
    }),
  ]);

  console.log('✅ Colaboradores criados:', employees.length);
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

**Adicionar ao package.json**:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Executar seed**:
```bash
npx prisma db seed
```

---

## 11. Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Criar migration
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Seed do banco
npx prisma db seed

# Build para produção
npm run build

# Rodar em produção
npm start
```

---

**Estes exemplos fornecem uma base sólida para implementar a API completa!**
