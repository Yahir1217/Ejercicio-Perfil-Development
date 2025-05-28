<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;

class Reserva extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'sala_id', 'inicio', 'fin', 'activa'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }
    public function getFechaAttribute()
    {
        return Carbon::parse($this->inicio)->format('Y-m-d');
    }

    public function getHoraInicioAttribute()
    {
        return Carbon::parse($this->inicio)->format('H:i');
    }

    public function getDuracionAttribute()
    {
        $inicio = Carbon::parse($this->inicio);
        $fin = Carbon::parse($this->fin);
        $diff = $inicio->diff($fin);
        return sprintf('%02d:%02d', $diff->h, $diff->i);
    }

    //codigo para automatizar el estado de las reservas
    public function getActivaAttribute($value)
    {
        $now = Carbon::now('America/Mazatlan');

        if ($now->lt($this->inicio)) {
            return 'activa'; // Aún no inicia, pero está programada
        } elseif ($now->between($this->inicio, $this->fin)) {
            return 'en_uso'; // Ya está en curso
        } else {
            return 'liberada'; // Ya terminó
        }
    }


}

