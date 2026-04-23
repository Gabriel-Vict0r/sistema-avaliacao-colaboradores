import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { authenticateAD, findADUser, extractSAMAccountName } from '../utils/ldap';

export class AuthService {
  async login(username: string, password: string) {
    const sAMAccountName = extractSAMAccountName(username);

    // 1. Validar credenciais contra o Active Directory
    let adAuthenticated: boolean;
    try {
      adAuthenticated = await authenticateAD(username, password);
    } catch (err) {
      console.error('[AuthService] Erro ao conectar ao AD:', err);
      throw Object.assign(new Error('Não foi possível conectar ao servidor de autenticação'), {
        statusCode: 503,
        code: 'AD_CONNECTION_ERROR',
      });
    }

    if (!adAuthenticated) {
      throw Object.assign(new Error('Credenciais inválidas'), {
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
      });
    }

    // 2. Buscar ou criar usuário no banco local
    let user = await prisma.user.findUnique({ where: { adUsername: sAMAccountName } });

    if (!user) {
      // Busca dados do AD para preencher o registro local
      let adUser = null;
      try {
        adUser = await findADUser(sAMAccountName);
      } catch {
        // Não critico: continua com dados mínimos
      }

      const email = adUser?.mail || adUser?.userPrincipalName || `${sAMAccountName}@empresa.local`;
      const name = adUser?.displayName || `${adUser?.givenName || ''} ${adUser?.sn || ''}`.trim() || sAMAccountName;

      user = await prisma.user.create({
        data: {
          adUsername: sAMAccountName,
          email,
          name,
          role: 'EVALUATOR',
        },
      });
    }

    if (!user.isActive) {
      throw Object.assign(new Error('Usuário desativado. Contate o administrador.'), {
        statusCode: 403,
        code: 'AUTH_USER_INACTIVE',
      });
    }

    // 3. Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 4. Gerar JWT
    const token = generateToken({
      userId: user.id,
      adUsername: user.adUsername,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        adUsername: user.adUsername,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    };
  }

  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        adUsername: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error('Usuário não encontrado'), {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    return user;
  }
}
