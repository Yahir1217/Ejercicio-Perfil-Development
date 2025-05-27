<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sala extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'capacidad', 'disponible'];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
