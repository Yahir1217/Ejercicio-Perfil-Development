import { Sala } from './sala';
import { Usuario } from './usuario';

export interface Reserva {
  id: number;
  sala_id?: number;
  user_id?: number;
  sala?: Sala;           
  user?: Usuario;        
  fecha?: string;
  hora?: string;
  estado: number; 
  fin?: string;
  activa: string; 
  hora_inicio?: string; 

}

