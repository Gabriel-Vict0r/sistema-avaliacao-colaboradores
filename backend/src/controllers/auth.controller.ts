import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest, successResponse, errorResponse } from "../types";
import { searchADUsers } from "../utils/ldap";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      res.json(successResponse(result));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res
        .status(Number(e.statusCode) || 401)
        .json(errorResponse(String(e.code || "AUTH_ERROR"), String(e.message)));
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json(successResponse(user));
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      res
        .status(Number(e.statusCode) || 500)
        .json(
          errorResponse(String(e.code || "INTERNAL_ERROR"), String(e.message)),
        );
    }
  }

  logout(_req: Request, res: Response) {
    // JWT é stateless; logout é tratado no cliente removendo o token
    res.json(successResponse({ message: "Logout realizado com sucesso" }));
  }

  async adUsers(req: AuthRequest, res: Response) {
    const search = req.query.search as string | undefined;

    const term = search?.trim() ?? '';

    try {
      const users = await searchADUsers(term || undefined);
      const mapped = users.map((u) => ({
        username: u.sAMAccountName,
        displayName:
          u.displayName ||
          `${u.givenName || ""} ${u.sn || ""}`.trim() ||
          u.sAMAccountName,
        email: u.mail || u.userPrincipalName || "",
      }));
      res.json(successResponse({ users: mapped }));
    } catch (err) {
      console.error("[AuthController] Erro ao buscar usuários do AD:", err);
      res
        .status(503)
        .json(
          errorResponse(
            "AD_CONNECTION_ERROR",
            "Não foi possível consultar o Active Directory",
          ),
        );
    }
  }
}
