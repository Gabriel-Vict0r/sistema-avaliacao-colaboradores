# Guia de Integração Frontend com API

Este documento descreve como integrar o frontend atual com a nova API backend.

---

## 1. Configuração do Axios

### 1.1 Instalar Axios

```bash
cd /workspaces/default/code
pnpm add axios
```

### 1.2 Criar Cliente HTTP

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

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Criar Arquivo .env

```bash
# .env.local
VITE_API_URL=http://localhost:3000/api
```

---

## 3. Services (Camada de API)

### 3.1 Auth Service

```typescript
// src/services/auth.service.ts
import { api } from '../lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EVALUATOR';
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    
    // Salvar token e usuário no localStorage
    localStorage.setItem('auth_token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
```

### 3.2 Employee Service

```typescript
// src/services/employee.service.ts
import { api } from '../lib/api';
import { Employee } from '../context/AppContext';

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  type?: 'GESTORES' | 'OPERACIONAIS';
  department?: string;
  search?: string;
}

export const employeeService = {
  async getAll(filters?: EmployeeFilters) {
    const response = await api.get('/employees', { params: filters });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  async create(data: Omit<Employee, 'id'>) {
    const response = await api.post('/employees', {
      name: data.name,
      position: data.position,
      department: data.department,
      type: data.type.toUpperCase(),
      managerId: data.managerId,
    });
    return response.data.data;
  },

  async update(id: string, data: Partial<Employee>) {
    const response = await api.put(`/employees/${id}`, {
      ...data,
      type: data.type?.toUpperCase(),
    });
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  async getPending(type?: string) {
    const response = await api.get('/employees/pending', {
      params: { type: type?.toUpperCase() },
    });
    return response.data.data;
  },
};
```

### 3.3 Evaluation Service

```typescript
// src/services/evaluation.service.ts
import { api } from '../lib/api';

export interface EvaluationRating {
  criterionId: string;
  criterionName: string;
  category: string;
  weight: number;
  rating: number;
}

export interface CreateEvaluationData {
  employeeId: string;
  type: 'GESTORES' | 'OPERACIONAIS';
  decision: 'MANTER' | 'DESLIGAR' | 'EM_EVOLUCAO';
  justification: string;
  ratings: EvaluationRating[];
}

export const evaluationService = {
  async getAll(filters?: {
    page?: number;
    limit?: number;
    employeeId?: string;
    type?: string;
    decision?: string;
  }) {
    const response = await api.get('/evaluations', {
      params: {
        ...filters,
        type: filters?.type?.toUpperCase(),
        decision: filters?.decision?.toUpperCase(),
      },
    });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get(`/evaluations/${id}`);
    return response.data.data;
  },

  async create(data: CreateEvaluationData) {
    const response = await api.post('/evaluations', {
      ...data,
      type: data.type.toUpperCase(),
      decision: data.decision.toUpperCase(),
    });
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateEvaluationData>) {
    const response = await api.put(`/evaluations/${id}`, {
      ...data,
      type: data.type?.toUpperCase(),
      decision: data.decision?.toUpperCase(),
    });
    return response.data.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/evaluations/${id}`);
    return response.data;
  },
};
```

---

## 4. Atualizar Context para usar API

### 4.1 Criar Auth Context

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/auth.service';
import { useNavigate } from 'react-router';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário armazenado
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 4.2 Atualizar App Context

```typescript
// src/context/AppContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { employeeService } from '../services/employee.service';
import { evaluationService } from '../services/evaluation.service';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  type: 'gestores' | 'operacionais';
  managerId?: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'gestores' | 'operacionais';
  ratings: Record<string, string>;
  average: number;
  decision: 'manter' | 'desligar' | 'em_avaliacao';
  justification: string;
  date: string;
}

interface AppContextType {
  employees: Employee[];
  evaluations: Evaluation[];
  isLoading: boolean;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  addEvaluation: (evaluation: Omit<Evaluation, 'id' | 'date'>) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  getEvaluationsByEmployee: (employeeId: string) => Evaluation[];
  getPendingEmployees: (type?: string) => Employee[];
  refreshEmployees: () => Promise<void>;
  refreshEvaluations: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([refreshEmployees(), refreshEvaluations()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      setEmployees(response.employees || []);
    } catch (error: any) {
      console.error('Erro ao carregar colaboradores:', error);
      throw error;
    }
  };

  const refreshEvaluations = async () => {
    try {
      const response = await evaluationService.getAll();
      setEvaluations(response.evaluations || []);
    } catch (error: any) {
      console.error('Erro ao carregar avaliações:', error);
      throw error;
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      await employeeService.create(employee);
      await refreshEmployees();
      toast.success('Colaborador cadastrado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao cadastrar colaborador');
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await employeeService.update(id, updates);
      await refreshEmployees();
      toast.success('Colaborador atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao atualizar colaborador');
      throw error;
    }
  };

  const addEvaluation = async (evaluation: Omit<Evaluation, 'id' | 'date'>) => {
    try {
      // Converter ratings de Record<string, string> para array
      const ratingsArray = Object.entries(evaluation.ratings).map(([criterionId, rating]) => {
        // Buscar informações do critério (você precisará ter acesso aos critérios aqui)
        // Por enquanto, vamos usar placeholder
        return {
          criterionId,
          criterionName: '', // Preencher com nome do critério
          category: '', // Preencher com categoria
          weight: 0, // Preencher com peso
          rating: parseFloat(rating),
        };
      });

      await evaluationService.create({
        employeeId: evaluation.employeeId,
        type: evaluation.type.toUpperCase() as 'GESTORES' | 'OPERACIONAIS',
        decision: evaluation.decision.toUpperCase() as 'MANTER' | 'DESLIGAR' | 'EM_EVOLUCAO',
        justification: evaluation.justification,
        ratings: ratingsArray,
      });

      await refreshEvaluations();
      toast.success('Avaliação salva com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao salvar avaliação');
      throw error;
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find((emp) => emp.id === id);
  };

  const getEvaluationsByEmployee = (employeeId: string) => {
    return evaluations.filter((evaluation) => evaluation.employeeId === employeeId);
  };

  const getPendingEmployees = (type?: string) => {
    return employees.filter((emp) => {
      const hasEvaluation = evaluations.some((evaluation) => evaluation.employeeId === emp.id);
      const matchesType = !type || emp.type === type;
      return !hasEvaluation && matchesType;
    });
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        evaluations,
        isLoading,
        addEmployee,
        updateEmployee,
        addEvaluation,
        getEmployeeById,
        getEvaluationsByEmployee,
        getPendingEmployees,
        refreshEmployees,
        refreshEvaluations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
```

---

## 5. Atualizar Página de Login

```typescript
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error: any) {
      console.error('Erro no login:', error);
      const errorMessage = error.response?.data?.error?.message || 'Credenciais inválidas';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Sistema de Avaliação
          </CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Método 180 graus
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Credenciais de teste:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin@empresa.com / admin123</p>
              <p><strong>Gestor:</strong> gestor@empresa.com / gestor123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 6. Proteção de Rotas

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### 6.2 Atualizar App.tsx

```typescript
// src/app/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Evaluation } from './pages/Evaluation';
import { Management } from './pages/Management';
import { EvaluationDetails } from './pages/EvaluationDetails';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/employees/:type" element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            } />
            
            <Route path="/evaluation/:type/:id" element={
              <ProtectedRoute>
                <Evaluation />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard/management" replace />} />
              <Route path="management" element={<Management />} />
            </Route>
            
            <Route path="/evaluation-details/:id" element={
              <ProtectedRoute>
                <EvaluationDetails />
              </ProtectedRoute>
            } />
          </Routes>
          
          <Toaster position="top-right" />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## 7. Adicionar Logout no Layout

```typescript
// Atualizar src/components/Layout.tsx
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

// Adicionar botão de logout na sidebar
const { logout, user } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
  await logout();
  navigate('/login');
};

// No JSX da sidebar:
<div className="p-4 border-t">
  <div className="mb-2 text-sm text-gray-600">
    {user?.name}
  </div>
  <Button
    variant="outline"
    size="sm"
    onClick={handleLogout}
    className="w-full"
  >
    <LogOut className="w-4 h-4 mr-2" />
    Sair
  </Button>
</div>
```

---

## 8. Tratamento de Erros Globais

```typescript
// src/lib/error-handler.ts
import { toast } from 'sonner';

export const handleApiError = (error: any) => {
  if (error.response) {
    // Erro da API
    const message = error.response.data?.error?.message || 'Erro ao processar requisição';
    toast.error(message);
  } else if (error.request) {
    // Sem resposta do servidor
    toast.error('Erro de conexão com o servidor');
  } else {
    // Erro desconhecido
    toast.error('Erro inesperado');
  }
  
  console.error('API Error:', error);
};
```

---

## 9. Loading States

```typescript
// src/components/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Usar nas páginas:
if (isLoading) return <LoadingSpinner />;
```

---

## 10. Checklist de Migração

### Backend
- [ ] API desenvolvida e testada
- [ ] Banco de dados configurado
- [ ] Seed executado (usuários e dados iniciais)
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado para aceitar frontend
- [ ] API rodando e acessível

### Frontend
- [ ] Axios instalado
- [ ] Variável VITE_API_URL configurada
- [ ] Cliente HTTP criado (api.ts)
- [ ] Services criados (auth, employee, evaluation)
- [ ] AuthContext implementado
- [ ] AppContext atualizado para usar API
- [ ] Login atualizado
- [ ] ProtectedRoute implementado
- [ ] Rotas protegidas
- [ ] Logout implementado
- [ ] Tratamento de erros
- [ ] Loading states
- [ ] Testar fluxo completo

---

## 11. Testes de Integração

### Testar Manualmente:
1. Login com credenciais válidas
2. Login com credenciais inválidas
3. Proteção de rotas (acesso sem login)
4. Listagem de colaboradores
5. Cadastro de colaborador
6. Edição de colaborador
7. Criação de avaliação completa
8. Visualização de avaliação
9. Listagem de avaliações
10. Logout

### Verificar:
- Tokens JWT sendo enviados corretamente
- Mensagens de erro claras
- Loading states funcionando
- Redirecionamento após login/logout
- Dados persistindo no banco
- Cálculo correto da média ponderada

---

**Com isso, o frontend estará totalmente integrado com a API backend!**
