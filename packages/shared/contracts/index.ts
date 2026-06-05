
import { initContract } from '@ts-rest/core';
import { authContract } from './auth.contract';

const c = initContract();

export const apiContract = c.router({
  auth: authContract,
});

export * from './auth.contract';
