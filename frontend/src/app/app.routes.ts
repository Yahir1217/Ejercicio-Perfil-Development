import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./componentes/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'inicio',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./componentes/vista-principal/vista-principal.component').then(m => m.VistaPrincipalComponent),
  },
  {
    path: 'salas',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./componentes/salas/salas.component').then(m => m.SalasComponent),
  },
  {
    path: 'reservas',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./componentes/reservas/reservas.component').then(m => m.ReservasComponent),
  },
  {
    path: 'usuarios',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./componentes/usuarios/usuarios.component').then(m => m.UsuariosComponent),
  },
  {
    path: 'reservas_sin_salas',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./componentes/reservas-sin-sala/reservas-sin-sala.component').then(m => m.ReservasSinSalaComponent),
  }, 
];
