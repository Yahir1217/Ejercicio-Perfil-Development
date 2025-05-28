import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService } from '../../servicios/api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  imports: [CommonModule, RouterModule, HttpClientModule]
})
export class MenuComponent implements OnInit {
  mobileMenuOpen = false;
  dropdownOpen = false;

  nombreUsuario: string = '';
  emailUsuario: string = '';

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        const id = sessionStorage.getItem('user_id');
        if (id) {
          this.apiService.obtenerUsuario(id).subscribe({
            next: (data) => {
              this.nombreUsuario = data.name;
              this.emailUsuario = data.email;
            },
            error: (err) => {
              console.error('Error al obtener usuario:', err);
            }
          });
        } else {
          console.warn('ID de usuario no encontrado en sessionStorage.');
        }
      } else {
        console.warn('Token no disponible todavía, no se llamó a obtenerUsuario().');
      }
    }
  }
  

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMenus() {
    this.dropdownOpen = false;
    this.mobileMenuOpen = false;
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        this.router.navigate(['/login']);
      }
    });  
  }
}
