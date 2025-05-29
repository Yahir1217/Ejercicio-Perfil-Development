import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';

/**
 * Componente de Login
 * 
 * Este componente permite al usuario iniciar sesión en la aplicación.
 * Si el login es exitoso, se guarda el token JWT en el sessionStorage
 * y se redirige al usuario a la vista de inicio.
 */
@Component({
  selector: 'app-login', // Nombre del selector para usar el componente en HTML
  standalone: true, // Permite que el componente sea independiente (sin un módulo padre)
  templateUrl: './login.component.html', // Ruta al archivo de plantilla HTML
  imports: [FormsModule, CommonModule, HttpClientModule], // Módulos necesarios
})
export class LoginComponent {
  // Variables para almacenar los datos del formulario de login
  email: string = '';
  password: string = '';

  /**
   * Constructor
   * 
   * @param auth Servicio de autenticación para enviar las credenciales al backend
   * @param router Servicio de enrutamiento para redirigir después del login
   */
  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Método que se ejecuta al inicializar el componente.
   * 
   * Si el usuario ya tiene un token guardado en sessionStorage,
   * se redirige automáticamente a la vista de inicio.
   */
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.router.navigate(['/inicio']);
      }
    }
  }

  /**
   * Método que se ejecuta al enviar el formulario de login.
   * 
   * Llama al servicio AuthService para autenticar al usuario.
   * Si las credenciales son correctas:
   *  - Guarda el token y el user_id en sessionStorage.
   *  - Muestra una alerta de éxito con SweetAlert.
   *  - Redirige al usuario a la vista de inicio.
   * 
   * Si las credenciales son incorrectas:
   *  - Muestra una alerta de error con SweetAlert.
   */
  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        // Guardar token y ID de usuario
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('user_id', res.user_id);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Inicio de sesión exitoso!',
          showConfirmButton: false,
          timer: 1500,
        });

        // Redirigir al usuario a la vista principal
        this.router.navigate(['/inicio']);
      },
      error: () => {
        // Mostrar mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Correo o contraseña incorrectos',
        });
      },
    });
  }
}
