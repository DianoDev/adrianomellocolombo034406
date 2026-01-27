import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token && !authService.isTokenExpired()) {
    return true;
  }

  if (token && authService.isTokenExpired()) {
    return new Promise<boolean>((resolve) => {
      authService.refresh().subscribe({
        next: () => resolve(true),
        error: () => {
          router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }

  router.navigate(['/login']);
  return false;
};

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token && !authService.isTokenExpired()) {
    router.navigate(['/pets']);
    return false;
  }

  return true;
};
