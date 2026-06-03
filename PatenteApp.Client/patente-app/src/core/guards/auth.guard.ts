import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Firebase authState es asíncrono. Retornamos un Observable para que el Router espere.
  return authState(auth).pipe(
    map(user => {
      if (user) {
        return true; // Usuario autenticado, le permitimos pasar
      } else {
        return router.createUrlTree(['/login']); // Lo redirigimos al login de forma segura
      }
    })
  );
};

export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Si ya está logueado, no debería ver la pantalla de login, lo mandamos al quiz.
  return authState(auth).pipe(
    map(user => {
      if (!user) {
        return true;
      } else {
        return router.createUrlTree(['/quiz']);
      }
    })
  );
};