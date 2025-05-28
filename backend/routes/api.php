<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalaController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\UsuarioController;

// Ruta pública para login
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas por autenticación
Route::middleware('auth:api')->group(function () {

    // Rutas para las salas
    Route::get('/salas', [SalaController::class, 'index']);  // Obtener todas las salas
    Route::post('/salas', [SalaController::class, 'store']); // Crear una nueva sala
    Route::put('/salas/{id}', [SalaController::class, 'update']); // Editar una sala existente
    Route::delete('/salas/{id}', [SalaController::class, 'destroy']); // Eliminar una sala

    // Rutas para las reservas
    Route::get('/reservas', [ReservaController::class, 'index']); // Obtener todas las reservas
    Route::post('/reservas', [ReservaController::class, 'store']); // Crear una nueva reserva
    Route::put('/reservas/{id}', [ReservaController::class, 'update']); // Editar una reserva
    Route::delete('/reservas/{reserva}', [ReservaController::class, 'destroy']); // ✅ Esta es la correcta
    Route::put('/reservas/{id}/asignar-sala', [ReservaController::class, 'asignarSala']);
    Route::get('/reservas/sin-sala', [ReservaController::class, 'reservasSinSala']);
    Route::get('/reservas-2', [ReservaController::class, 'index2']);


    // Rutas para los usuarios
    Route::get('/usuarios', [UsuarioController::class, 'index']);  // Obtener todos los usuarios
    Route::post('/usuarios', [UsuarioController::class, 'store']); // Crear un nuevo usuario
    Route::put('/usuarios/{id}', [UsuarioController::class, 'update']); // Editar un usuario existente
    Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']); // Eliminar un usuario
    Route::get('/usuario/{id}', [UsuarioController::class, 'obtenerUsuario']);

});

