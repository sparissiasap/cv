import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'sergio', pathMatch: 'full' },
  {
    path: 'menu',
    loadComponent: () => import('./components/menu/menu.component').then(m => m.MenuComponent)
  },
  {
    path: 'sergio',
    loadComponent: () => import('./components/cv/cv.component').then(m => m.CvComponent),
    data: { profile: 'Sergio' }
  },
  {
    path: 'dafne',
    loadComponent: () => import('./components/cv/cv.component').then(m => m.CvComponent),
    data: { profile: 'Dafne' }
  },
  {
    path: 'giovanna',
    loadComponent: () => import('./components/cv/cv.component').then(m => m.CvComponent),
    data: { profile: 'Giovanna' }
  },
  {
    path: 'teresina',
    loadComponent: () => import('./components/cv/cv.component').then(m => m.CvComponent),
    data: { profile: 'Teresina' }
  },
  { path: 'Sergio', redirectTo: 'sergio', pathMatch: 'full' },
  { path: 'Dafne', redirectTo: 'dafne', pathMatch: 'full' },
  { path: 'Giovanna', redirectTo: 'giovanna', pathMatch: 'full' },
  { path: 'Teresina', redirectTo: 'teresina', pathMatch: 'full' },
  { path: '**', redirectTo: 'menu' }
];
