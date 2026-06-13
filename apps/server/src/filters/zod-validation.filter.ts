import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';

@Catch(ZodValidationException)
export class ZodValidationFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<import('fastify').FastifyReply>();
    
    const errors = exception.getZodError().errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    response.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      errors,
    });
  }
}
