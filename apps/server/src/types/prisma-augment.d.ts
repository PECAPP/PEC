import '@prisma/client';

declare module '@prisma/client' {
  // PrismaClient includes a runtime method `$use` for middlewares. Some
  // Prisma 7 typings may not expose it on the client type used by NestJS
  // classes that extend the generated client. Augment the interface here
  // so TypeScript understands it.
  interface PrismaClient {
    /**
     * Register a Prisma middleware.
     * @param cb middleware function (params, next)
     */
    $use(cb: (params: any, next: (params: any) => Promise<any>) => Promise<any> | any): void;
  }
}
