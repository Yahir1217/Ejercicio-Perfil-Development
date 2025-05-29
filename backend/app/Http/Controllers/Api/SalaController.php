<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sala;
use App\Models\Reserva;
use Illuminate\Http\Request;

class SalaController extends Controller
{
    /**
     * Obtiene la lista de todas las salas registradas.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $salas = Sala::all();
        return response()->json($salas);
    }

    /**
     * Crea una nueva sala con los datos proporcionados.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1',
            'disponible' => 'required|boolean'
        ]);

        $sala = Sala::create([
            'nombre' => $request->nombre,
            'capacidad' => $request->capacidad,
            'disponible' => $request->disponible
        ]);

        return response()->json($sala, 201);
    }

    /**
     * Actualiza una sala existente con nuevos datos.
     *
     * Si se marca como no disponible (`disponible` = 0),
     * se eliminan las reservas futuras asociadas a esa sala (se les asigna `sala_id = null`).
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $sala = Sala::find($id);
    
        if (!$sala) {
            return response()->json(['message' => 'Sala no encontrada'], 404);
        }
    
        $request->validate([
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1',
            'disponible' => 'required|boolean'
        ]);
    
        $sala->update([
            'nombre' => $request->nombre,
            'capacidad' => $request->capacidad,
            'disponible' => $request->disponible
        ]);
    
        // Si la sala se marca como no disponible, se liberan sus reservas futuras
        if ($request->disponible == 0) {
            Reserva::where('sala_id', $sala->id)
                ->where('inicio', '>', now())
                ->update(['sala_id' => null]);
        }
        
        return response()->json($sala, 200);
    }

    /**
     * Elimina una sala del sistema por su ID.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $sala = Sala::find($id);

        if (!$sala) {
            return response()->json(['message' => 'Sala no encontrada'], 404);
        }

        $sala->delete();

        return response()->json(['message' => 'Sala eliminada con éxito'], 200);
    }
}
