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

  // Lista completa de usuarios y lista filtrada para mostrar
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  // Variables para búsqueda, modal y formulario
  filtroBusqueda: string = '';
  modalAbierto: boolean = false;

  // Modelo para nuevo usuario o usuario en edición
  nuevaUsuario: Partial<Usuario> = {
    id: undefined,
    name: '',
    email: '',
  };

  // Bandera para saber si se está editando un usuario
  esEdicion: boolean = false;

  // Inyección del servicio de API
  constructor(private apiService: ApiService) {}

  // Ciclo de vida al inicializar el componente
  ngOnInit() {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token'); // Verificación de token JWT
      if (token) {
        this.obtenerUsuarios(); // Si hay token, se consultan los usuarios
      } else {
        console.warn('Token no disponible todavía, no se llamó a obtenerUsuarios().');
      }
    }
  }

  // Consulta la lista de usuarios desde la API
  obtenerUsuarios() {
    this.apiService.obtenerUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.filtrarUsuarios(); // Aplica filtro al obtener datos
      },
      error: (error) => console.error('Error al obtener usuarios:', error)
    });
  }

  // Filtra la lista de usuarios en base al campo de búsqueda
  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const nombre = usuario.name?.toLowerCase() || '';
      const email = usuario.email?.toLowerCase() || '';
      return nombre.includes(this.filtroBusqueda.toLowerCase()) || email.includes(this.filtroBusqueda.toLowerCase());
    });
  }

  // Abre el modal para agregar o editar usuario
  abrirModal(usuario?: Usuario) {
    if (usuario) {
      this.esEdicion = true;
      this.nuevaUsuario = { ...usuario }; // Se copia el usuario a editar
    } else {
      this.esEdicion = false;
      this.nuevaUsuario = { id: undefined, name: '', email: '' }; // Valores vacíos para nuevo usuario
    }
    this.modalAbierto = true;
  }

  // Cierra el modal y limpia el formulario
  cerrarModal() {
    this.modalAbierto = false;
    this.nuevaUsuario = { id: undefined, name: '', email: '' };
  }

  // Guarda un nuevo usuario o actualiza uno existente
  guardarUsuario() {
    if (this.esEdicion) {
      // Actualización de usuario
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
      // Agregar nuevo usuario
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

  // Abre el modal con datos del usuario a editar
  editarUsuario(usuario: Usuario) {
    this.abrirModal(usuario); 
  }

  // Elimina un usuario con confirmación
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
            this.obtenerUsuarios(); // Recarga la lista
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          }
        });
      }
    });
  }
}
