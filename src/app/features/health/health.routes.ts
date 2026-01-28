import { Routes } from '@angular/router';

export const HEALTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/health-status/health-status.component').then(m => m.HealthStatusComponent)
  }
];
