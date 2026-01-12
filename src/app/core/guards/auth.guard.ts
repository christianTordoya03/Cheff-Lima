import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, filter, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    // Esperamos a que el estado deje de ser 'undefined' (cargando sesión)
    filter(user => user !== undefined),
    take(1), // Tomamos el primer valor real (null o User)
    map(user => {
      if (user) {
        return true; // Acceso permitido
      } else {
        // Acceso denegado: Redirigir a login guardando la URL intentada
        return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url }});
      }
    })
  );
};