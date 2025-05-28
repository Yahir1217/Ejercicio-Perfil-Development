import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ApiService } from '../../servicios/api.service';
import { Usuario } from '../../interface/usuario'; 

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtroBusqueda: string = '';
  modalAbierto: boolean = false;
  nuevaUsuario: Partial<Usuario> = {
    id: undefined,
    name: '',
    email: '',
  };

  // Indicador para saber si es un nuevo usuario o uno a editar
  esEdicion: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.obtenerUsuarios();
      } else {
        console.warn('Token no disponible todavía, no se llamó a obtenerUsuarios().');
      }
    }
  }

  obtenerUsuarios() {
    this.apiService.obtenerUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.filtrarUsuarios();
      },
      error: (error) => console.error('Error al obtener usuarios:', error)
    });
  }

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const nombre = usuario.name?.toLowerCase() || '';
      const email = usuario.email?.toLowerCase() || '';
  
      return nombre.includes(this.filtroBusqueda.toLowerCase()) || email.includes(this.filtroBusqueda.toLowerCase());
    });
  }

  abrirModal(usuario?: Usuario) {
    if (usuario) {
      // Si el usuario existe, estamos en modo edición
      this.esEdicion = true;
      this.nuevaUsuario = { ...usuario }; // Copiar los datos del usuario al formulario
    } else {
      // Si no hay usuario, estamos en modo de creación
      this.esEdicion = false;
      this.nuevaUsuario = { id: undefined, name: '', email: '' }; // Limpiar el formulario
    }
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.nuevaUsuario = { id: undefined, name: '', email: '' };
  }

  guardarUsuario() {
    if (this.esEdicion) {
      // Si estamos en modo edición, actualizar el usuario
      this.apiService.actualizarUsuario(this.nuevaUsuario).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
          this.obtenerUsuarios();
          this.cerrarModal();
        },
        error: (error) => {
          Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
          console.error('Error al actualizar usuario:', error);
        }
      });
    } else {
      // Si estamos en modo agregar, crear el nuevo usuario
      this.apiService.agregarUsuario(this.nuevaUsuario).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Usuario agregado correctamente', 'success');
          this.obtenerUsuarios();
          this.cerrarModal();
        },
        error: (error) => {
          Swal.fire('Error', 'No se pudo agregar el usuario', 'error');
          console.error('Error al agregar usuario:', error);
        }
      });
    }
  }

  editarUsuario(usuario: Usuario) {
    this.abrirModal(usuario); // Abre el modal en modo edición
  }

  eliminarUsuario(id: number) {
    if (id === undefined) return;
  
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.eliminarUsuario(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El usuario fue eliminado con éxito', 'success');
            this.obtenerUsuarios();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          }
        });
      }
    });
  }
}
