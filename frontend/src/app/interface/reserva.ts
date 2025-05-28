import { Sala } from './sala';
import { Usuario } from './usuario';

export interface Reserva {
  id: number;
  sala_id?: number;
  user_id?: number;
  sala?: Sala;           // <- ahora es un objeto, no string
  user?: Usuario;        // <- ahora es un objeto, no string
  fecha?: string;
  hora?: string;
  estado: number; // 1 para activa, 0 para finalizada
  fin?: string;
  activa: string; // <- explícitamente number
  hora_inicio?: string; // <-- Agrega esta línea

}

