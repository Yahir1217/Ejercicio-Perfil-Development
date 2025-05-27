// src/app/servicios/api.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8000/api'; // Ajusta según sea necesario

  constructor(private http: HttpClient) { }

  crearSala(sala: any) {
    return this.http.post(`${this.baseUrl}/salas`, sala);
  }
  obtenerSalas() {
    return this.http.get<any[]>(`${this.baseUrl}/salas`);
  }
  
  
}

