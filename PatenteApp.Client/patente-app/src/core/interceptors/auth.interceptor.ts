import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constans';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const user = auth.currentUser;

  if (!user || !req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  // Si hay usuario, obtenemos su token JWT de Firebase y lo clonamos en los Headers
  return from(user.getIdToken()).pipe(
    switchMap(token => {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    })
  );
};