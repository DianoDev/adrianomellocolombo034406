import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pets',
    pathMatch: 'full'
  },
  {
    path: 'pets',
    loadChildren: () => import('./features/pets/pets.routes').then(m => m.PETS_ROUTES)
  }
];
