<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sala;
use Illuminate\Http\Request;

class SalaController extends Controller
{
    // Obtener todas las salas
    public function index()
    {
        $salas = Sala::all();
        return response()->json($salas);
    }

    // Crear una nueva sala
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

    // Editar una sala existente
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

        return response()->json($sala, 200);
    }

    // Eliminar una sala
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
