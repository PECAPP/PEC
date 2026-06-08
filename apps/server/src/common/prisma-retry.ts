import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 100
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2034' // P2034: Transaction failed due to a write conflict or a deadlock.
      ) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt)); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error('Prisma retry wrapper failed unexpectedly.');
}
