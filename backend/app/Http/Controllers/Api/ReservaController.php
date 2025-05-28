<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReservaController extends Controller
{

    public function index()
    {
        return Reserva::with(['user', 'sala'])
            ->whereNotNull('sala_id')
            ->get()
            ->map(function ($reserva) {
                return [
                    'id' => $reserva->id,
                    'user_id' => $reserva->user_id,
                    'sala_id' => $reserva->sala_id,
                    'inicio' => $reserva->inicio,
                    'fin' => $reserva->fin,
                    'activa' => $reserva->activa,
                    'created_at' => $reserva->created_at,
                    'updated_at' => $reserva->updated_at,
                    'fecha' => $reserva->fecha,
                    'hora_inicio' => $reserva->hora_inicio,
                    'hora' => $reserva->duracion,
                    'user' => $reserva->user,
                    'sala' => $reserva->sala,
                ];
            });
    }
    
    

    public function store(Request $request)
    {
        \Log::info($request->all());
    
        $request->validate([
            'sala_id' => 'required|exists:salas,id',
            'usuario_id' => 'required|exists:users,id',
            'inicio' => 'required|date|before:fin',
            'fin' => 'required|date|after:inicio',
        ]);
    
        // Verificar si la sala ya está reservada en el rango de tiempo
        $existeReserva = Reserva::where('sala_id', $request->sala_id)
            ->where(function($query) use ($request) {
                $query->whereBetween('inicio', [$request->inicio, $request->fin])
                      ->orWhereBetween('fin', [$request->inicio, $request->fin]);
            })
            ->exists();
    
        if ($existeReserva) {
            return response()->json(['error' => 'La sala ya está reservada en este rango horario.'], 400);
        }
    
        $reserva = Reserva::create([
            'user_id' => $request->usuario_id, // ← usamos usuario_id recibido para guardar en user_id
            'sala_id' => $request->sala_id,
            'inicio' => $request->inicio,
            'fin' => $request->fin,
            'activa' => 'activa', // ← El valor por defecto al dar de alta
        ]);
    
        return response()->json($reserva, 201);
    }
    

    public function show(Reserva $reserva)
    {
        return $reserva->load(['user', 'sala']);
    }
    
    public function update(Request $request, $id)
    {
        // Validar usando los nombres del frontend
        $request->validate([
            'fecha' => 'required|date',
            'hora' => ['required', 'regex:/^\d{1,2}:\d{2}$/'], // duración (HH:mm)
            'inicio' => 'required|date_format:Y-m-d H:i:s',
            'fin' => 'required|date_format:Y-m-d H:i:s',
            'sala_id' => 'required|exists:salas,id',
            'usuario_id' => 'required|exists:users,id',
        ]);
    
        // Mapear campos al formato que maneja la base de datos
        $reserva = Reserva::findOrFail($id);
    
        $reserva->update([
            'user_id' => $request->usuario_id, // Mapeado desde "usuario_id"
            'sala_id' => $request->sala_id,
            'inicio' => $request->inicio,
            'fin' => $request->fin,
        ]);
    
        return response()->json(['message' => 'Reserva actualizada correctamente']);
    }
    

    public function destroy(Reserva $reserva)
    {
        $reserva->delete();

        return response()->json(null, 204);
    }

    public function reservasSinSala()
{
    $reservas = Reserva::with('user') // Asegúrate de tener la relación con 'user' en el modelo
        ->whereNull('sala_id')
        ->orderBy('inicio', 'desc')
        ->get();

    return response()->json($reservas, 200);
}

public function asignarSala(Request $request, $id)
{
    $reserva = Reserva::find($id);

    if (!$reserva) {
        return response()->json(['message' => 'Reserva no encontrada'], 404);
    }

    $validated = $request->validate([
        'sala_id' => 'required|exists:salas,id',
    ]);

    $reserva->sala_id = $validated['sala_id'];
    $reserva->save();

    return response()->json(['message' => 'Sala asignada correctamente']);
}


}
