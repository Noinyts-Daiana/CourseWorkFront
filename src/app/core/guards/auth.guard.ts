import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

// ─── Базовий guard: перевіряє чи залогінений юзер ────────────────────────────
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/']);
  return false;
};

// ─── Guard з перевіркою конкретного пермішину ─────────────────────────────────
export const permissionGuard =
  (permission: string): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/']);
      return false;
    }

    if (auth.hasPermission(permission)) return true;

    // Є сесія, але немає прав — редіректимо на дашборд
    router.navigate(['/dashboard']);
    return false;
  };
