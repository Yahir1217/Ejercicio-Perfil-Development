<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modelo Sala
 *
 * Representa una sala de juntas que puede ser reservada.
 *
 * @property int $id
 * @property string $nombre Nombre de la sala
 * @property int $capacidad Capacidad máxima de personas
 * @property bool $disponible Indica si la sala está disponible para reservas
 *
 * @property \Illuminate\Database\Eloquent\Collection|\App\Models\Reserva[] $reservas
 */
class Sala extends Model
{
    use HasFactory;

    /**
     * Atributos asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = ['nombre', 'capacidad', 'disponible'];

    /**
     * Relación: una sala tiene muchas reservas.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
