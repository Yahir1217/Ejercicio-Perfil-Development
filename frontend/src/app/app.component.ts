import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuComponent } from './componentes/menu/menu.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <div *ngIf="!isLoginPage">
      <!-- Menú visible solo si NO estamos en /login -->
      <app-menu></app-menu>
    </div>
 
    <!-- Siempre muestra el contenido de la ruta activa -->
    <router-outlet></router-outlet>
  `,
  imports: [RouterModule, MenuComponent, CommonModule],
})
export class AppComponent {
  isLoginPage: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isLoginPage = this.router.url === '/login';
    });
  }
}
