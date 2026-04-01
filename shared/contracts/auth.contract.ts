
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { 
  AuthLoginSchema, 
  AuthSignupSchema, 
  AuthResponseSchema 
} from '../schemas/erp';

const c = initContract();

export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/auth/login',
    responses: {
      200: AuthResponseSchema,
      401: z.object({ message: z.string() }),
    },
    body: AuthLoginSchema,
    summary: 'Login to the PEC ERP',
  },
  signup: {
    method: 'POST',
    path: '/auth/signup',
    responses: {
      201: AuthResponseSchema,
      400: z.object({ message: z.string() }),
      409: z.object({ message: z.string() }),
    },
    body: AuthSignupSchema,
    summary: 'Sign up for a new account',
  },
});
