<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;

/**
 * Modelo Reserva
 *
 * Representa una reserva de una sala hecha por un usuario.
 *
 * @property int $id
 * @property int $user_id
 * @property int|null $sala_id
 * @property string $inicio Fecha y hora de inicio
 * @property string $fin Fecha y hora de fin
 * @property string $activa Estado actual de la reserva (calculado)
 * @property-read string $fecha Fecha en formato 'Y-m-d'
 * @property-read string $hora_inicio Hora en formato 'H:i'
 * @property-read string $duracion Duración en formato 'HH:MM'
 * 
 * @property \App\Models\User $user
 * @property \App\Models\Sala|null $sala
 */
class Reserva extends Model
{
    use HasFactory;

    /**
     * Campos que se pueden asignar masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = ['user_id', 'sala_id', 'inicio', 'fin', 'activa'];

    protected $casts = [
        'inicio' => 'datetime',
        'fin' => 'datetime',
    ];

    /**
     * Relación: una reserva pertenece a un usuario.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación: una reserva pertenece a una sala (puede ser null si no se ha asignado).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    /**
     * Accesor para el atributo `fecha` (solo la fecha de inicio).
     *
     * @return string
     */
    public function getFechaAttribute()
    {
        return Carbon::parse($this->inicio)->format('Y-m-d');
    }

    /**
     * Accesor para el atributo `hora_inicio` (solo la hora de inicio).
     *
     * @return string
     */
    public function getHoraInicioAttribute()
    {
        return Carbon::parse($this->inicio)->format('H:i');
    }

    /**
     * Accesor para calcular la duración entre `inicio` y `fin` en formato 'HH:MM'.
     *
     * @return string
     */
    public function getDuracionAttribute()
    {
        $inicio = Carbon::parse($this->inicio);
        $fin = Carbon::parse($this->fin);
        $diff = $inicio->diff($fin);
        return sprintf('%02d:%02d', $diff->h, $diff->i);
    }

    /**
     * Accesor para el atributo `activa`.
     *
     * Este valor es calculado dinámicamente:
     * - Devuelve 'liberada' si ya fue marcada como tal.
     * - Devuelve 'activa' si aún no comienza.
     * - Devuelve 'en_uso' si está en curso y tiene sala asignada.
     * - Devuelve 'liberada' si ya terminó.
     *
     * @param string $value Valor actual almacenado en la base de datos.
     * @return string Estado actual de la reserva.
     */
    public function getActivaAttribute($value)
    {
        // Si ya fue liberada manualmente, se respeta ese valor.
        if ($value === 'liberada') {
            return 'liberada';
        }

        $now = Carbon::now('America/Mazatlan');

        if ($now->lt($this->inicio)) {
            return 'activa'; // Aún no empieza
        } elseif ($now->between($this->inicio, $this->fin)) {
            if (is_null($this->sala_id)) {
                return 'activa'; // En curso, pero sin sala
            }
            return 'en_uso'; // En curso y con sala asignada
        } else {
            return 'liberada'; // Terminó automáticamente
        }
    }
}
