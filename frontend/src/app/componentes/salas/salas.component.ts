import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../servicios/api.service';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './salas.component.html',
  styleUrls: ['./salas.component.css']
})
export class SalasComponent implements OnInit {
  mostrarModal = false;
  salas: any[] = [];

  nuevaSala = {
    nombre: '',  
    capacidad: null,
    disponible: 1
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.obtenerSalas();
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevaSala = { nombre: '', capacidad: null, disponible: 1 };
  }

  guardarSala() {
    this.apiService.crearSala(this.nuevaSala).subscribe({
      next: (response) => {
        Swal.fire('Éxito', 'Sala creada correctamente', 'success');
        this.cerrarModal();
        this.obtenerSalas(); // <-- Recargar la lista después de crear
      },
      error: (error) => {
        Swal.fire('Error', 'Hubo un problema al crear la sala', 'error');
      }
    });
  }

  obtenerSalas() {
    this.apiService.obtenerSalas().subscribe({
      next: (data) => {
        this.salas = data;
      },
      error: (error) => {
        console.error('Error al obtener salas:', error);
      }
    });
  }
}
