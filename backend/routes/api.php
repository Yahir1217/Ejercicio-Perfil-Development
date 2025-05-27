<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalaController;
use App\Http\Controllers\Api\ReservaController;

// Ruta pública para login
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/usuario', function () {
        return auth()->user();
    }); 

    Route::apiResource('salas', SalaController::class);
    Route::apiResource('reservas', ReservaController::class);
});
