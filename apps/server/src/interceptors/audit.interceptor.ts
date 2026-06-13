import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { dbContext } from '@pec/database';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // user is usually populated by AuthGuard which runs before interceptors!
    const user = request.user;
    
    return new Observable((subscriber) => {
      dbContext.run({ userId: user?.uid, role: user?.role }, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
