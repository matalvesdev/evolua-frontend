import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';

/**
 * JWT do Supabase. Estrutura do payload Supabase:
 *   { sub: <uuid>, email, role, aud, exp, iat, ... }
 *
 * Em microservices Go/Python o Fastify atua como gateway:
 * valida o token e repassa user.id em header `x-user-id`.
 */
export type AuthUser = {
  id: string;
  email?: string;
  role?: string;
  clinicId?: string | null;
};

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser;
  }
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
    authenticateOptional: (req: FastifyRequest, rep: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email?: string; role?: string };
    user: AuthUser;
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {
  await app.register(jwt, {
    secret: env.SUPABASE_JWT_SECRET,
    verify: { algorithms: ['HS256'] },
    formatUser: (payload) => ({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }),
  });

  app.decorate('authenticate', async (req: FastifyRequest, rep: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      return rep.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
    }
  });

  app.decorate('authenticateOptional', async (req: FastifyRequest) => {
    try {
      await req.jwtVerify();
    } catch {
      // ignore — rota é pública
    }
  });
};

export default fp(authPlugin, { name: 'auth' });
