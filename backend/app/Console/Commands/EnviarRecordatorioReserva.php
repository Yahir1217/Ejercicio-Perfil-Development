<?php

namespace App\Console\Commands;
use App\Models\Reserva;
use App\Models\User;
use App\Models\Sala;
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
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ahora = now();
        $reservas = Reserva::where('inicio', $ahora->copy()->addMinutes(15)->format('Y-m-d H:i:00'))->get();
    
        foreach ($reservas as $reserva) {
            $user = $reserva->usuario; // Asegúrate de tener relación con User
            $sala = $reserva->sala;    // Asegúrate de tener relación con Sala
    
            Mail::send('emails.recordatorio', [
                'usuario' => $user->name,
                'sala' => $sala->nombre,
                'fecha' => $reserva->fecha,
                'hora_inicio' => $reserva->inicio->format('H:i'),
            ], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('¡Tu reserva está por comenzar!');
            });
        }
    }
    
}
