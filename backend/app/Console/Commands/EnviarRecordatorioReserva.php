<?php

namespace App\Console\Commands;

use App\Models\Reserva;
use Illuminate\Support\Facades\Mail;
use Illuminate\Console\Command;

class EnviarRecordatorioReserva extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:enviar-recordatorio-reserva';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía un correo recordatorio 15 minutos antes del inicio de una reserva';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ahora = now();
    
        // Asegura que cargamos las relaciones correctas: 'user' y 'sala'
        $reservas = Reserva::with(['user', 'sala'])
            ->where('inicio', $ahora->copy()->addMinutes(15)->format('Y-m-d H:i:00'))
            ->get();
    
        foreach ($reservas as $reserva) {
            $user = $reserva->user;
            $sala = $reserva->sala;
    
            // Validar que existan relaciones
            if (!$user || !$sala) {
                $this->warn("Reserva ID {$reserva->id} no tiene usuario o sala asociado. Se omitió.");
                continue;
            }
    
            Mail::send('emails.recordatorio', [
                'usuario' => $user->name,
                'sala' => $sala->nombre,
                'fecha' => $reserva->fecha,
                'hora_inicio' => $reserva->inicio->format('H:i'),
            ], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('¡Tu reserva está por comenzar!');
            });
    
            $this->info("Correo enviado a {$user->email} por la reserva ID {$reserva->id}.");
        }
    }
    
    
}
