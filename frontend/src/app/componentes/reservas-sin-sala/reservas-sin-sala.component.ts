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
  // Lista completa de reservas sin sala
  reservasSinSala: any[] = [];

  // Lista filtrada que se muestra en la tabla
  reservasSinSalaFiltradas: any[] = [];

  // Texto del input de búsqueda
  filtroBusqueda: string = '';

  // Controla si el modal de asignación está abierto
  modalAsignarAbierto: boolean = false;

  // Reserva actualmente seleccionada para asignar sala
  reservaAsignar: any = null;

  // Filtro por nombre de sala
  busquedaSala: string = '';

  // Filtro por capacidad mínima de la sala
  busquedaCapacidad: number | null = null;

  // Objeto parcial para la reserva a actualizar (solo campos necesarios)
  nuevaReserva: Partial<Reserva> = {
    sala_id: 0,
    user_id: 0,
    fecha: '',
    hora: '',
    hora_inicio: '', 
    fin: ''
  };

  // Lista completa de salas cargadas desde la API
  salas: Sala[] = [];

  // Paso actual en el proceso de asignación (se puede ampliar si se agregan pasos)
  currentStep: number = 1;

  constructor(private apiService: ApiService) {}

  // Se ejecuta al iniciar el componente
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

  // Carga todas las salas desde el backend
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

  // Obtiene el nombre de una sala dado su ID
  obtenerNombreSala(id: number) {
    const sala = this.salas.find(s => s.id === id);
    return sala ? sala.nombre : '';
  }

  // Filtra las salas según el texto y la capacidad ingresada
  salasFiltradas() {
    return this.salas.filter(sala => {
      const coincideNombre = sala.nombre.toLowerCase().includes(this.busquedaSala?.toLowerCase() || '');
      const cumpleCapacidad = this.busquedaCapacidad == null || sala.capacidad >= this.busquedaCapacidad;
      return coincideNombre && cumpleCapacidad;
    });
  }

  // Asigna la sala seleccionada al objeto `nuevaReserva`
  seleccionarSala(sala: any) {
    this.nuevaReserva.sala_id = sala.id;
  }

  // Carga todas las reservas sin sala desde la API
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

  // Filtra reservas sin sala por nombre de usuario o ID
  filtrarReservasSinSala(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.reservasSinSalaFiltradas = this.reservasSinSala.filter((reserva) =>
      (reserva.user?.name?.toLowerCase().includes(filtro) || reserva.id.toString().includes(filtro))
    );
  }

  // Cierra el modal de asignación de sala y reinicia los datos
  cerrarModalAsignar() {
    this.modalAsignarAbierto = false;
    this.reservaAsignar = null;
    this.nuevaReserva = {};
  }

  // Confirma la asignación de sala a la reserva seleccionada
  confirmarAsignacionSala() {
    if (this.reservaAsignar && this.nuevaReserva.sala_id) {
      this.apiService.actualizarSalaEnReserva(this.reservaAsignar.id, this.nuevaReserva.sala_id).subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Sala asignada',
            text: 'La sala fue asignada correctamente a la reserva.',
            confirmButtonColor: '#10B981' 
          });
          this.cargarReservasSinSala(); 
          this.cerrarModalAsignar();
        },
        (error) => {
          console.error('Error al asignar sala a la reserva', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al asignar la sala.',
            confirmButtonColor: '#EF4444' 
          });
        }
      );
    }
  }

  // Abre el modal de asignación y prepara los datos necesarios
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
    this.cargarSalas();
  }

  // Elimina una reserva sin sala previa confirmación del usuario
  eliminarReserva(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la reserva permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.eliminarReserva(id).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'La reserva fue eliminada correctamente.', 'success');
            this.cargarReservasSinSala(); // refrescar datos
          },
          error: (error) => {
            console.error('Error al eliminar reserva', error);
            Swal.fire('Error', 'No se pudo eliminar la reserva.', 'error');
          }
        });
      }
    });
  }
}
