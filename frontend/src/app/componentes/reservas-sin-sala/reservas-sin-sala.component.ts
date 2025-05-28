import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../servicios/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Sala } from '../../interface/sala';
import { Reserva } from '../../interface/reserva';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas-sin-sala',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reservas-sin-sala.component.html',
  styleUrl: './reservas-sin-sala.component.css'
})
export class ReservasSinSalaComponent implements OnInit {
  reservasSinSala: any[] = [];
  reservasSinSalaFiltradas: any[] = [];
  filtroBusqueda: string = '';
  modalAsignarAbierto: boolean = false;
  reservaAsignar: any = null;
  busquedaSala: string = '';
  busquedaCapacidad: number | null = null;
  nuevaReserva: Partial<Reserva> = {
    sala_id: 0,
    user_id: 0,
    fecha: '',
    hora: '',
    hora_inicio: '',  // <-- usa esta
    fin: ''
  };
  salas: Sala[] = [];
  currentStep: number = 1;

  constructor(private apiService: ApiService) {}



  ngOnInit() {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.cargarReservasSinSala();

      } else {
        console.warn('Token no disponible todavía, no se llamó a cargarReservasSinSala().');
      }
    }
  }
  cargarSalas(): void {
    this.apiService.obtenerSalas().subscribe(
      (res) => {
        this.salas = res;
      },
      (err) => {
        console.error('Error al cargar salas', err);
      }
    );
  }
  
  obtenerNombreSala(id: number) {
    const sala = this.salas.find(s => s.id === id);
    return sala ? sala.nombre : '';
  }

  salasFiltradas() {
    return this.salas.filter(sala => {
      const coincideNombre = sala.nombre.toLowerCase().includes(this.busquedaSala?.toLowerCase() || '');
      const cumpleCapacidad = this.busquedaCapacidad == null || sala.capacidad >= this.busquedaCapacidad;
      return coincideNombre && cumpleCapacidad;
    });
  }

  seleccionarSala(sala: any) {
    this.nuevaReserva.sala_id = sala.id;
  }

  cargarReservasSinSala(): void {
    this.apiService.getReservasSinSala().subscribe(
      (res) => {
        this.reservasSinSala = res;
        this.reservasSinSalaFiltradas = res;
      },
      (err) => {
        console.error('Error al cargar reservas sin sala', err);
      }
    );
  }

  filtrarReservasSinSala(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.reservasSinSalaFiltradas = this.reservasSinSala.filter((reserva) =>
      (reserva.user?.name?.toLowerCase().includes(filtro) || reserva.id.toString().includes(filtro))
    );
  }

  cerrarModalAsignar() {
    this.modalAsignarAbierto = false;
    this.reservaAsignar = null;
    this.nuevaReserva = {};
  }
  
  confirmarAsignacionSala() {
    if (this.reservaAsignar && this.nuevaReserva.sala_id) {
      this.apiService.actualizarSalaEnReserva(this.reservaAsignar.id, this.nuevaReserva.sala_id).subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Sala asignada',
            text: 'La sala fue asignada correctamente a la reserva.',
            confirmButtonColor: '#10B981' // emerald-500
          });
          this.cargarReservasSinSala(); // Actualiza la lista
          this.cerrarModalAsignar();
        },
        (error) => {
          console.error('Error al asignar sala a la reserva', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al asignar la sala.',
            confirmButtonColor: '#EF4444' // red-500
          });
        }
      );
    }
  }
  

  asignarSala(reserva: any) {
    this.reservaAsignar = { ...reserva };
    this.nuevaReserva = {
      ...reserva,
      sala_id: null
    };
    this.busquedaSala = '';
    this.busquedaCapacidad = null;
    this.modalAsignarAbierto = true;
    this.currentStep = 1;
  
    // ✅ Cargar salas desde el backend
    this.cargarSalas();
  }
  
  
  
  eliminarReserva(id: number) {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      this.apiService.eliminarReserva(id).subscribe(() => {
        this.cargarReservasSinSala(); // Recarga la lista después de eliminar
      });
    } 
  }
  
}
