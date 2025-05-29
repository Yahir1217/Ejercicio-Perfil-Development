import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2'; 
import { ApiService } from '../../servicios/api.service'; // Servicio personalizado para acceder a la API
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-menu', 
  standalone: true,     
  templateUrl: './menu.component.html', 
  imports: [CommonModule, RouterModule, HttpClientModule] 
})
export class MenuComponent implements OnInit {

  // Variables para controlar visibilidad de menús
  mobileMenuOpen = false; // Menú lateral en modo móvil
  dropdownOpen = false;   // Menú desplegable del perfil

  // Datos del usuario autenticado
  nombreUsuario: string = '';
  emailUsuario: string = '';

  // Inyección de dependencias necesarias
  constructor(private router: Router, private apiService: ApiService) {}

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    // Comprobación para asegurarse que estamos en el entorno del navegador
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token'); // Obtener token del sessionStorage

      // Si hay token, intentar recuperar los datos del usuario
      if (token) {
        const id = sessionStorage.getItem('user_id'); // Obtener ID del usuario

        if (id) {
          // Llamada al backend para obtener los datos del usuario actual
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

  // Alternar el estado del menú móvil
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Cerrar todos los menús abiertos (útil para manejar eventos globales)
  closeMenus() {
    this.dropdownOpen = false;
    this.mobileMenuOpen = false;
  }

  // Método para cerrar sesión
  logout() {
    // Mostrar alerta de confirmación
    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Borrar datos de sesión y redirigir al login
        sessionStorage.clear();
        this.router.navigate(['/login']);
      }
    });  
  }
}
