import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService); const router = inject(Router);
  return next(req).pipe(catchError((err: HttpErrorResponse) => {
    if (err.status === 401 && !req.url.endsWith('/auth/login')) auth.cerrarSesion('expirada', router.url);
    // Un 403 no cierra la sesión: la pantalla/componente puede mostrar el mensaje.
    return throwError(() => err);
  }));
};
