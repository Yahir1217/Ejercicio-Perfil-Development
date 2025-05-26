<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReservaController extends Controller
{
    public function index()
    {
        return Reserva::with(['user', 'sala'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'sala_id' => 'required|exists:salas,id',
            'hora_inicio' => 'required|date|before:hora_fin',
            'hora_fin' => 'required|date|after:hora_inicio',
        ]);

        $reserva = Reserva::create([
            'user_id' => Auth::id(), // Asumiendo que usas auth con token
            'sala_id' => $request->sala_id,
            'hora_inicio' => $request->hora_inicio,
            'hora_fin' => $request->hora_fin,
            'activa' => true,
        ]);

        return response()->json($reserva, 201);
    }

    public function show(Reserva $reserva)
    {
        return $reserva->load(['user', 'sala']);
    }

    public function update(Request $request, Reserva $reserva)
    {
        $request->validate([
            'hora_inicio' => 'required|date|before:hora_fin',
            'hora_fin' => 'required|date|after:hora_inicio',
            'activa' => 'boolean',
        ]);

        $reserva->update($request->only(['hora_inicio', 'hora_fin', 'activa']));

        return response()->json($reserva, 200);
    }

    public function destroy(Reserva $reserva)
    {
        $reserva->delete();

        return response()->json(null, 204);
    }
}
