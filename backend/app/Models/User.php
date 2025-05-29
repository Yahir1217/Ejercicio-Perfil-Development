<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo User
 *
 * Representa a un usuario del sistema que puede autenticar y realizar reservas de salas.
 *
 * @property int $id
 * @property string $name Nombre del usuario
 * @property string $email Correo electrónico
 * @property string $password Contraseña (oculta)
 * @property \Illuminate\Support\Carbon|null $email_verified_at Fecha de verificación de email
 * @property string|null $remember_token Token para recordar sesión
 *
 * @property \Illuminate\Database\Eloquent\Collection|\App\Models\Reserva[] $reservas
 */
class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * Atributos asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Atributos ocultos para arrays y respuestas JSON.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts automáticos de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relación: un usuario tiene muchas reservas.
     *
     * @return HasMany
     */
    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    /**
     * Devuelve el identificador único que se almacenará en el JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Devuelve un arreglo de claims personalizados para el JWT.
     *
     * @return array<string, mixed>
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
