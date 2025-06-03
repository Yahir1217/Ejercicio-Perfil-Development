<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;


class ReservaController extends Controller
{
    /**
     * Retorna todas las reservas con sus relaciones de usuario y sala.
     * (Incluye también reservas sin sala asignada).
     */
    public function index2()
    {
        $reservas = Reserva::with(['user', 'sala'])->get();
        return response()->json($reservas);
    }

    /**
     * Retorna solo las reservas que tienen una sala asignada.
     * Se mapean para retornar una estructura específica con más claridad.
     */
    public function index()
    {
        return Reserva::with(['user', 'sala'])
            ->whereNotNull('sala_id')
            ->get()
            ->map(function ($reserva) {
                $inicio = Carbon::parse($reserva->fecha . ' ' . $reserva->hora_inicio);
                [$horas, $minutos] = explode(':', $reserva->duracion);
                $fin = $inicio->copy()->addHours((int) $horas)->addMinutes((int) $minutos);
    
                return [
                    'id' => $reserva->id,
                    'user_id' => $reserva->user_id,
                    'sala_id' => $reserva->sala_id,
                    'inicio' => $inicio->toIso8601String(),
                    'fin' => $fin->format('H:i'), // Solo hora en formato 24 hrs
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

    /**
     * Crea una nueva reserva, validando que no haya solapamiento con otras reservas de la misma sala.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        \Log::info($request->all()); // Log para depuración

        $request->validate([
            'sala_id' => 'required|exists:salas,id',
            'usuario_id' => 'required|exists:users,id',
            'inicio' => 'required|date|before:fin',
            'fin' => 'required|date|after:inicio',
        ]);

        // Verifica que no haya otra reserva en el mismo rango horario
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
            'user_id' => $request->usuario_id,
            'sala_id' => $request->sala_id,
            'inicio' => $request->inicio,
            'fin' => $request->fin,
            'activa' => 'activa',
        ]);

        return response()->json($reserva, 201);
    }

    /**
     * Muestra una reserva específica con sus relaciones cargadas.
     *
     * @param Reserva $reserva
     * @return mixed
     */
    public function show(Reserva $reserva)
    {
        return $reserva->load(['user', 'sala']);
    }

    /**
     * Actualiza una reserva existente.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'fecha' => 'required|date',
            'hora' => ['required', 'regex:/^\d{1,2}:\d{2}$/'],
            'inicio' => 'required|date_format:Y-m-d H:i:s',
            'fin' => 'required|date_format:Y-m-d H:i:s',
            'sala_id' => 'required|exists:salas,id',
            'usuario_id' => 'required|exists:users,id',
        ]);

        $reserva = Reserva::findOrFail($id);

        $reserva->update([
            'user_id' => $request->usuario_id,
            'sala_id' => $request->sala_id,
            'inicio' => $request->inicio,
            'fin' => $request->fin,
        ]);

        return response()->json(['message' => 'Reserva actualizada correctamente']);
    }

    /**
     * Elimina una reserva.
     *
     * @param Reserva $reserva
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Reserva $reserva)
    {
        $reserva->delete();
        return response()->json(null, 204);
    }

    /**
     * Retorna todas las reservas que aún no tienen sala asignada.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function reservasSinSala()
    {
        $reservas = Reserva::with('user')
            ->whereNull('sala_id')
            ->orderBy('inicio', 'desc')
            ->get();

        return response()->json($reservas, 200);
    }

    /**
     * Asigna una sala a una reserva existente.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Libera manualmente una reserva (cambia su estado a "liberada").
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function liberar($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $reserva->activa = 'liberada';
        $reserva->updated_at = now();
        $reserva->save();

        return response()->json(['message' => 'Reserva liberada correctamente'], 200);
    }
}
