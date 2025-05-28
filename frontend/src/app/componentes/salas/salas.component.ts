import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ApiService } from '../../servicios/api.service';
import { Sala } from '../../interface/sala'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './salas.component.html',
  styleUrls: ['./salas.component.css']
})
export class SalasComponent implements OnInit {
  mostrarModal = false;
  editando = false;
  salas: Sala[] = [];
  salasFiltradas: Sala[] = [];

  nuevaSala: Partial<Sala> = {
    id: undefined,
    nombre: '',
    capacidad: 0,
    disponible: 1
  };

  // Variables para búsqueda y filtro
  filtroBusqueda: string = '';
  filtroDisponibilidad: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.obtenerSalas();
      } else {
        console.warn('Token no disponible todavía, no se llamó a obtenerSalas().');
      }
    }
  }

  obtenerSalas() {
    this.apiService.obtenerSalas().subscribe({
      next: (data: Sala[]) => {
        this.salas = data;
        this.filtrarSalas();
      },
      error: (error) => console.error('Error al obtener salas:', error)
    });
  }

  filtrarSalas() {
    this.salasFiltradas = this.salas.filter(sala => {
      const nombreCoincide = sala.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      const disponibilidadCoincide = this.filtroDisponibilidad ? sala.disponible === +this.filtroDisponibilidad : true;

      return nombreCoincide && disponibilidadCoincide;
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

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

  editarSala(sala: Sala) {
    this.nuevaSala = { ...sala };
    this.editando = true;
    this.abrirModal();
  }

  guardarSala() {
    if (this.editando && this.nuevaSala.id !== undefined) {
      this.apiService.actualizarSala(this.nuevaSala.id, this.nuevaSala).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Sala actualizada correctamente', 'success');
          this.cerrarModal();
          this.obtenerSalas();
        },
        error: () => {
          Swal.fire('Error', 'Hubo un problema al actualizar la sala', 'error');
        }
      });
    } else {
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
            this.obtenerSalas();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la sala', 'error');
          }
        });
      }
    });
  }
}
