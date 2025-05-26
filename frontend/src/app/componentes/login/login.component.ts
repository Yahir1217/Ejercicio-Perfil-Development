import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        sessionStorage.setItem('token', res.token);

        // Encriptar user_id (simple base64)
        const encryptedId = btoa(res.user_id.toString());
        sessionStorage.setItem('user_id', encryptedId);

        Swal.fire({
          icon: 'success',
          title: '¡Inicio de sesión exitoso!',
          showConfirmButton: false,
          timer: 1500,
        });

        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Correo o contraseña incorrectos',
        });
      },
    });
  }
}
