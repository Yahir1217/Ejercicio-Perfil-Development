// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./componentes/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./componentes/vista-principal/vista-principal.component').then(m => m.VistaPrincipalComponent),
  },
];
