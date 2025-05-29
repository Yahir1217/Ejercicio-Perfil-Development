<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalaController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\UsuarioController;

/**
 * API Routes
 * 
 * Este archivo define las rutas disponibles para el API de la aplicación,
 * incluyendo rutas públicas (como login) y rutas protegidas mediante autenticación.
 */

// Ruta pública para iniciar sesión y obtener el token JWT
Route::post('/login', [AuthController::class, 'login']);

/**
 * Rutas protegidas por middleware 'auth:api'
 * 
 * Estas rutas solo pueden ser accedidas por usuarios autenticados mediante JWT.
 */
Route::middleware('auth:api')->group(function () {

    /**
     * Rutas relacionadas con la gestión de salas
     */
    
    // Obtener el listado completo de salas
    Route::get('/salas', [SalaController::class, 'index']);

    // Crear una nueva sala 
    Route::post('/salas', [SalaController::class, 'store']);

    // Actualizar una sala existente por ID
    Route::put('/salas/{id}', [SalaController::class, 'update']);

    // Eliminar una sala por ID
    Route::delete('/salas/{id}', [SalaController::class, 'destroy']);

    /**
     * Rutas relacionadas con la gestión de reservas
     */

    // Obtener las reservas que tienen sala asignada
    Route::get('/reservas', [ReservaController::class, 'index']);

    // Crear una nueva reserva
    Route::post('/reservas', [ReservaController::class, 'store']);

    // Actualizar una reserva existente
    Route::put('/reservas/{id}', [ReservaController::class, 'update']);

    // Eliminar una reserva por ID
    Route::delete('/reservas/{reserva}', [ReservaController::class, 'destroy']);

    // Asignar una sala a una reserva existente
    Route::put('/reservas/{id}/asignar-sala', [ReservaController::class, 'asignarSala']);

    // Obtener todas las reservas sin sala asignada
    Route::get('/reservas/sin-sala', [ReservaController::class, 'reservasSinSala']);

    // Obtener todas las reservas (versión alternativa, posiblemente con más detalles)
    Route::get('/reservas-2', [ReservaController::class, 'index2']);

    // Liberar manualmente una reserva antes de que termine
    Route::put('/reservas/{id}/liberar', [ReservaController::class, 'liberar']);

    /**
     * Rutas relacionadas con la gestión de usuarios
     */

    // Obtener todos los usuarios del sistema
    Route::get('/usuarios', [UsuarioController::class, 'index']);

    // Registrar un nuevo usuario
    Route::post('/usuarios', [UsuarioController::class, 'store']);

    // Editar un usuario existente por ID
    Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);

    // Eliminar un usuario por ID
    Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);

    // Obtener nombre y correo electrónico de un usuario por ID
    Route::get('/usuario/{id}', [UsuarioController::class, 'obtenerUsuario']);
});
