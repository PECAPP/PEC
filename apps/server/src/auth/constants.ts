try { require('dotenv/config'); } catch (e) {}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const jwtConstants = { secret: process.env.JWT_SECRET };
