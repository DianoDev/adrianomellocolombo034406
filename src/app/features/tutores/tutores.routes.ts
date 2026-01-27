import { Routes } from '@angular/router';

export const TUTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/tutor-list/tutor-list.component').then(m => m.TutorListComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./components/tutor-form/tutor-form.component').then(m => m.TutorFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/tutor-detail/tutor-detail.component').then(m => m.TutorDetailComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./components/tutor-form/tutor-form.component').then(m => m.TutorFormComponent)
  }
];
