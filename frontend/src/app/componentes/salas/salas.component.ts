import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ApiService } from '../../servicios/api.service';
import { Sala } from '../../interface/sala'; 

@Component({ 
  selector: 'app-salas', 
  standalone: true, 
  imports: [CommonModule, FormsModule, HttpClientModule], 
  templateUrl: './salas.component.html', 
  styleUrls: ['./salas.component.css'] 
})
export class SalasComponent implements OnInit {
  // Variables de control para el modal y edición
  mostrarModal = false;
  editando = false;

  // Listas de salas: original y filtrada
  salas: Sala[] = [];
  salasFiltradas: Sala[] = [];

  // Objeto usado para crear/editar una sala
  nuevaSala: Partial<Sala> = {
    id: undefined,
    nombre: '',
    capacidad: 0,
    disponible: 1
  };

  // Filtros de búsqueda y disponibilidad
  filtroBusqueda: string = '';
  filtroDisponibilidad: string = '';

  constructor(private apiService: ApiService) {}

  // Método que se ejecuta al iniciar el componente
  ngOnInit() {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token'); // Validar si hay token activo
      if (token) {
        this.obtenerSalas(); // Obtener salas si hay sesión activa
      } else {
        console.warn('Token no disponible todavía, no se llamó a obtenerSalas().');
      }
    }
  }

  // Llama al servicio para obtener la lista de salas desde el backend
  obtenerSalas() {
    this.apiService.obtenerSalas().subscribe({
      next: (data: Sala[]) => {
        this.salas = data;
        this.filtrarSalas(); // Se aplican filtros al cargar
      },
      error: (error) => console.error('Error al obtener salas:', error)
    });
  }

  // Filtra la lista de salas según nombre y disponibilidad
  filtrarSalas() {
    this.salasFiltradas = this.salas.filter(sala => {
      const nombreCoincide = sala.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      const disponibilidadCoincide = this.filtroDisponibilidad ? sala.disponible === +this.filtroDisponibilidad : true;

      return nombreCoincide && disponibilidadCoincide;
    });
  }

  // Muestra el modal para agregar o editar
  abrirModal() {
    this.mostrarModal = true;
  }

  // Cierra el modal y reinicia el formulario
  cerrarModal() {
    this.mostrarModal = false;
    this.editando = false;
    this.nuevaSala = {
      id: undefined,
      nombre: '',
      capacidad: 0,
      disponible: 1
    };
  }

  // Carga los datos de la sala seleccionada y abre el modal en modo edición
  editarSala(sala: Sala) {
    this.nuevaSala = { ...sala };
    this.editando = true;
    this.abrirModal();
  }

  // Guarda la sala, ya sea una nueva o una existente
  guardarSala() {
    if (this.editando && this.nuevaSala.id !== undefined) {
      // Actualiza sala existente
      this.apiService.actualizarSala(this.nuevaSala.id, this.nuevaSala).subscribe({
        next: () => { 
          Swal.fire('Éxito', 'Sala actualizada correctamente', 'success');
          this.cerrarModal();
          this.obtenerSalas(); // Refresca la lista
        },
        error: () => {
          Swal.fire('Error', 'Hubo un problema al actualizar la sala', 'error');
        }
      });
    } else {
      // Crea una nueva sala
      this.apiService.crearSala(this.nuevaSala).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Sala creada correctamente', 'success');
          this.cerrarModal();
          this.obtenerSalas();
        }, 
        error: () => {
          Swal.fire('Error', 'Hubo un problema al crear la sala', 'error');
        }
      });
    }
  }

  // Elimina una sala con confirmación mediante SweetAlert
  eliminarSala(id: number | undefined) {
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
        this.apiService.eliminarSala(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La sala fue eliminada con éxito', 'success');
            this.obtenerSalas(); // Actualiza la tabla después de eliminar
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la sala', 'error');
          }
        });
      }
    });
  }
}
