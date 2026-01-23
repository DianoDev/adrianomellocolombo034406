import { Routes } from '@angular/router';

export const PETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/pet-list/pet-list.component').then(m => m.PetListComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./components/pet-form/pet-form.component').then(m => m.PetFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/pet-detail/pet-detail.component').then(m => m.PetDetailComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./components/pet-form/pet-form.component').then(m => m.PetFormComponent)
  }
];
