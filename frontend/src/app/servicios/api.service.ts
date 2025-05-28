import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { Sala } from '../interface/sala'; 
import { Usuario } from '../interface/usuario';
import { Reserva } from '../interface/reserva'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';
  private apiUrlUsuario = 'http://localhost:8000/api/usuarios';
  private apiUrlReserva = 'http://localhost:8000/api/reservas'; 

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
 
  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (this.isBrowser) {
      token = sessionStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerSalas(): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/salas`, {
      headers: this.getAuthHeaders()
    });
  }

  crearSala(sala: Partial<Sala>): Observable<Sala> {
    return this.http.post<Sala>(`${this.apiUrl}/salas`, sala, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarSala(id: number, sala: Partial<Sala>): Observable<Sala> {
    return this.http.put<Sala>(`${this.apiUrl}/salas/${id}`, sala, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarSala(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/salas/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Usuarios
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrlUsuario, {
      headers: this.getAuthHeaders()
    });
  }

  agregarUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrlUsuario, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrlUsuario}/${usuario.id}`, usuario, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlUsuario}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerUsuario(id: string) {
    return this.http.get<any>(`http://localhost:8000/api/usuario/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
  
  

   // Métodos para Reservas
   obtenerReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrlReserva, {
      headers: this.getAuthHeaders()
    });
  }

  agregarReserva(reserva: Partial<Reserva>): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrlReserva, reserva, {
      headers: this.getAuthHeaders()
    });
  }

  actualizarReserva(id: number, reserva: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrlReserva}/${id}`, reserva, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlReserva}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getReservasSinSala(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas/sin-sala`);
  }

  actualizarSalaEnReserva(reservaId: number, salaId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${reservaId}/asignar-sala`, 
      { sala_id: salaId }, 
      { headers: this.getAuthHeaders() }
    );
  }

  obtenerReservas2(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas-2`, {
      headers: this.getAuthHeaders()
    });
  }


  
  
  
  
}
