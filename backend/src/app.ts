import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import branchesRoutes from './routes/branches.routes';
import employeesRoutes from './routes/employees.routes';
import evaluationsRoutes from './routes/evaluations.routes';
import statsRoutes from './routes/stats.routes';

const app = express();

app.set('trust proxy', 1);

// ── Segurança ──────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// ── Rate Limiting ──────────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Tente novamente mais tarde.',
    },
  },
});
app.use('/api', limiter);

// ── Body Parser ────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// ── Rotas da API ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/stats', statsRoutes);

// ── 404 ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Rota não encontrada' },
  });
});

// ── Error Handler (deve ser o último middleware) ───────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`\n🚀 API rodando em http://localhost:${env.PORT}`);
  console.log(`📦 Ambiente: ${env.NODE_ENV}`);
  console.log(`🔐 Autenticação: Active Directory (${env.AD_URL})`);
  console.log(`🗄️  Banco: SQL Server\n`);
});

export default app;
