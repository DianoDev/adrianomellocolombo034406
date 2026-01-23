import { Routes } from '@angular/router';

export const PETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/pet-list/pet-list.component').then(m => m.PetListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/pet-detail/pet-detail.component').then(m => m.PetDetailComponent)
  }
];
