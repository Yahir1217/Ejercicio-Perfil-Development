import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [FormsModule, CommonModule, HttpClientModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Evita error si no estás en navegador (por ejemplo, durante SSR)
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.router.navigate(['/inicio']);
      }
    }
  }
  
  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('user_id', res.user_id); 

        Swal.fire({
          icon: 'success',
          title: '¡Inicio de sesión exitoso!',
          showConfirmButton: false,
          timer: 1500,
        });

        this.router.navigate(['/inicio']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Correo o contraseña incorrectos',
        });
      },
    });
  }
}
