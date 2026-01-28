import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pets',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'health',
    loadChildren: () => import('./features/health/health.routes').then(m => m.HEALTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'pets',
        loadChildren: () => import('./features/pets/pets.routes').then(m => m.PETS_ROUTES)
      },
      {
        path: 'tutores',
        loadChildren: () => import('./features/tutores/tutores.routes').then(m => m.TUTORES_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'pets'
  }
];
