import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ApiService } from '../../servicios/api.service';
import { Reserva } from '../../interface/reserva';
import { Sala } from '../../interface/sala';
import { Usuario } from '../../interface/usuario';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']  
})
export class ReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];  
  salas: Sala[] = [];
  usuarios: Usuario[] = [];
  filtroBusqueda: string = '';  
  estadoFiltro: string = '';   
  currentStep: number = 1;  
  nuevaReserva: Partial<Reserva> = {
    sala_id: 0,
    user_id: 0,
    fecha: '',
    hora: '',
    hora_inicio: '',  
    fin: ''
  };
    nuevoUsuario: Usuario = { id: 0, name: '', email: '' };  
  modalAbierto: boolean = false;  
  esEdicion: boolean = false;    
  busquedaSala: string = '';
  busquedaCapacidad: number | null = null;
  busquedaNombreUsuario: string = '';
  busquedaCorreoUsuario: string = '';
  errorHora: string = '';
  errorDuracion: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.obtenerSalas();
        this.obtenerUsuarios();
        this.obtenerReservas(); 
      } else {
        console.warn('Token no disponible todavía, no se llamó a obtenerUsuarios().');
      }
    }
  }

  liberarReserva(reserva: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción liberará la reserva seleccionada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, liberar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.liberarReserva(reserva.id).subscribe({
          next: () => {
            Swal.fire('Liberada', 'La reserva se liberó correctamente.', 'success');
            this.obtenerReservas(); 
          },
          error: (error) => {
            console.error('Error al liberar reserva', error);
            Swal.fire('Error', 'No se pudo liberar la reserva.', 'error');
          }
        });
      }
    });
  }
  
  

  usuariosFiltrados() {
    return this.usuarios.filter(usuario => {
      const coincideNombre = usuario.name.toLowerCase().includes(this.busquedaNombreUsuario.toLowerCase() || '');
      const coincideCorreo = usuario.email.toLowerCase().includes(this.busquedaCorreoUsuario.toLowerCase() || '');
      return coincideNombre && coincideCorreo;
    });
  }
  
  seleccionarUsuario(usuario: any) {
    this.nuevaReserva.user_id = usuario.id;
  }
  
  obtenerNombreUsuario(id: number): string {
    const usuario = this.usuarios.find(u => u.id === id);
    return usuario ? `${usuario.name} (${usuario.email})` : '';
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
  
  obtenerNombreSala(id: number) {
    const sala = this.salas.find(s => s.id === id);
    return sala ? sala.nombre : '';
  }

  obtenerSalas() {
    this.apiService.obtenerSalas().subscribe({
      next: (data) => {
        this.salas = data;
      },
      error: (error) => console.error('Error al obtener salas:', error)
    });
  }

  obtenerUsuarios() {
    this.apiService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => console.error('Error al obtener usuarios:', error)
    });
  }

  filtrarReservas() {
    const filtro = this.filtroBusqueda.toLowerCase();
    const estado = this.estadoFiltro.toLowerCase();
  
    this.reservasFiltradas = this.reservas.filter(reserva => {
      const nombreSala = reserva.sala?.nombre?.toLowerCase() || '';
      const nombreUsuario = reserva.user?.name?.toLowerCase() || '';
      const coincideSalaOUsuario = nombreSala.includes(filtro) || nombreUsuario.includes(filtro);
      
      const estadoReserva = (reserva.activa || '').toLowerCase(); 
      const coincideEstado = estado === '' || estadoReserva === estado;
  
      return coincideSalaOUsuario && coincideEstado;
    });
  }
  
  cambiarStep(step: number) {
    const nextStep = this.currentStep + step;
    if (nextStep >= 1 && nextStep <= 3) {
      this.currentStep = nextStep;
    }
  }

  validarHoraInicio(): boolean {
    this.errorHora = '';
  
    if (!this.nuevaReserva.hora_inicio || !this.nuevaReserva.fecha) {
      return false;
    }
  
    const [horaStr, minutoStr] = this.nuevaReserva.hora_inicio.split(':');
    const hora = parseInt(horaStr, 10);
    const minuto = parseInt(minutoStr, 10);
  
    if (isNaN(hora) || isNaN(minuto) || hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
      this.errorHora = 'Hora inválida. Usa formato HH:mm (Ej: 08:30)';
      return false;
    }
  
    const hoy = this.obtenerFechaActualZona('America/Mazatlan');
    const [añoSel, mesSel, diaSel] = this.nuevaReserva.fecha.split('-').map(Number);
    const fechaSeleccionada = new Date(añoSel, mesSel - 1, diaSel);
  
    const esHoy = hoy.toDateString() === fechaSeleccionada.toDateString();
  
    if (esHoy) {
      const ahora = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mazatlan',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
  
      const partes = formatter.formatToParts(ahora);
      const horaActual = parseInt(partes.find(p => p.type === 'hour')?.value ?? '0');
      const minutoActual = parseInt(partes.find(p => p.type === 'minute')?.value ?? '0');
  
      if (hora < horaActual || (hora === horaActual && minuto < minutoActual)) {
        this.errorHora = 'La hora debe ser igual o posterior a la hora actual';
        return false;
      }
    }
  
    return true;
  }
  
  validarFecha() {
    if (!this.nuevaReserva.fecha) {
      Swal.fire('Error', 'La fecha es obligatoria', 'error');
      return false;
    }
  
    const [añoSel, mesSel, diaSel] = this.nuevaReserva.fecha.split('-').map(Number); 
    const fechaSeleccionada = new Date(añoSel, mesSel - 1, diaSel);
  
    const hoy = this.obtenerFechaActualZona('America/Mazatlan');
  
    
    if (
      fechaSeleccionada.getFullYear() < hoy.getFullYear() ||
      (fechaSeleccionada.getFullYear() === hoy.getFullYear() && fechaSeleccionada.getMonth() < hoy.getMonth()) ||
      (fechaSeleccionada.getFullYear() === hoy.getFullYear() && fechaSeleccionada.getMonth() === hoy.getMonth() && fechaSeleccionada.getDate() < hoy.getDate())
    ) {
      Swal.fire('Error', 'No puedes seleccionar una fecha anterior a la actual', 'error');
      this.nuevaReserva.fecha = '';
      return false;
    }
  
    return true;
  }
  
  obtenerFechaActualZona(timeZone: string): Date {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  
    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value ?? '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value ?? '1') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value ?? '1');
  
    return new Date(year, month, day);
  }
  

  validarDuracion(): boolean {
    this.errorDuracion = '';
  
    const horaMinuto = this.nuevaReserva.hora?.trim();
  
    if (!horaMinuto || horaMinuto.length !== 5) {
      this.errorDuracion = 'Formato inválido. Usa HH:MM';
      return false;
    }
  
    const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  
    if (!regex.test(horaMinuto)) {
      this.errorDuracion = 'Formato de duración inválido. Usa HH:MM';
      return false;
    }
  
    const [hora, minuto] = horaMinuto.split(':').map(Number);
  
    if (hora === 0 && minuto === 0) {
      this.errorDuracion = 'No puedes seleccionar 00:00 como duración';
      return false;
    }
  
    if (hora > 2 || (hora === 2 && minuto > 0)) {
      this.errorDuracion = 'La duración máxima es 02:00';
      this.nuevaReserva.hora = '02:00';  
      return false;
    }
  
    if (minuto < 0 || minuto > 59) {
      this.errorDuracion = 'Los minutos deben estar entre 00 y 59';
      return false;
    }
  
    return true;
  }
  
  formatearFechaConZona(date: Date, timeZone: string = 'America/Mazatlan'): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
  }
  

  guardarReserva() {
    const fechaValida = this.validarFecha();
    const duracionValida = this.validarDuracion();
    const horaValida = this.validarHoraInicio();

    if (!fechaValida || !duracionValida || !horaValida) {
      Swal.fire('Error', 'Corrige los errores antes de guardar', 'error');
      return;
    }    
  
    if (!this.nuevaReserva.fecha || !this.nuevaReserva.hora) {
      Swal.fire('Error', 'Faltan datos de fecha u hora', 'error');
      return;
    }
  
    const horaInicio = new Date(this.nuevaReserva.fecha + ' ' + this.nuevaReserva.hora_inicio);
  
    const [horaDuracion, minutoDuracion] = this.nuevaReserva.hora.split(':').map(Number);
    const duracionEnMinutos = horaDuracion * 60 + minutoDuracion;
  
    const horaFin = new Date(horaInicio.getTime() + duracionEnMinutos * 60000);
  
    const horaInicioStr = this.formatearFechaConZona(horaInicio);
    const horaFinStr = this.formatearFechaConZona(horaFin);

  
    const reserva = {
      sala_id: this.nuevaReserva.sala_id,
      usuario_id: this.nuevaReserva.user_id, 
      fecha: this.nuevaReserva.fecha,
      hora: this.nuevaReserva.hora,
      inicio: horaInicioStr,
      fin: horaFinStr
    };
  
    if (this.esEdicion && this.nuevaReserva.id) {
      this.apiService.actualizarReserva(this.nuevaReserva.id, reserva).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Reserva actualizada correctamente', 'success');
          this.obtenerReservas();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar reserva:', error);
          Swal.fire('Error', 'No se pudo actualizar la reserva', 'error');
        }
      });
    } else {

      this.apiService.agregarReserva(reserva).subscribe({
        next: (response) => {
          Swal.fire('Éxito', 'Reserva agregada correctamente', 'success');
          this.obtenerReservas();
          this.cerrarModal();
        },
        error: (error) => {

          if (error.status === 422 && error.error.errors) {
            let mensajeErrores = '';
            for (let campo in error.error.errors) {
              mensajeErrores += `${campo}: ${error.error.errors[campo].join(', ')}\n`;
            }
            Swal.fire('Error', `Errores en los datos:\n${mensajeErrores}`, 'error');
          } else {
            console.error("Error al guardar reserva:", error.error);
            Swal.fire('Error', 'No se pudo agregar la reserva', 'error');
          }
        }
      });
    }
  }
  
  cerrarModal() {
    this.modalAbierto = false;
    this.currentStep = 1;
    this.nuevaReserva = {
      sala_id: 0,
      user_id: 0,
      fecha: '',
      hora: '',
      fin: ''
    };
      }

  abrirModal() {
    this.modalAbierto = true;
    this.esEdicion = false; 
    this.nuevaReserva = {
      sala_id: 0,
      user_id: 0,
      fecha: '',
      hora: '',
      fin: ''
    };
      }

  actualizarReserva(reserva: Reserva) {
    this.esEdicion = true;
    this.nuevaReserva = { ...reserva }; 
    this.modalAbierto = true;
  }

  eliminarReserva(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la reserva permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.eliminarReserva(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La reserva fue eliminada correctamente.', 'success');
            this.obtenerReservas();
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo eliminar la reserva', 'error');
            console.error('Error al eliminar reserva:', error);
          }
        });
      }
    });
  }
  
  obtenerReservas() {
    this.apiService.obtenerReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.filtrarReservas();  
      },
      error: (error) => console.error('Error al obtener reservas:', error)
    });
  }
}
