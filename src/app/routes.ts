import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Management } from "./pages/Management";
import { Employees } from "./pages/Employees";
import { Evaluation } from "./pages/Evaluation";
import { EvaluationDetails } from "./pages/EvaluationDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  // Mantém compatibilidade com rota antiga /login/:type
  {
    path: "/login/:type",
    Component: Login,
  },
  {
    path: "/employees/:type",
    Component: Employees,
  },
  {
    path: "/dashboard/evaluations",
    Component: Dashboard,
  },
  {
    path: "/dashboard/management",
    Component: Management,
  },
  {
    path: "/dashboard/employees/:type",
    Component: Employees,
  },
  {
    path: "/dashboard/evaluation/:type/:id",
    Component: Evaluation,
  },
  {
    path: "/dashboard/evaluation-details/:id",
    Component: EvaluationDetails,
  },
]);
