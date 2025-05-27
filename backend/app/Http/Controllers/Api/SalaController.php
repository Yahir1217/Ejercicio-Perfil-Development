<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sala;
use Illuminate\Http\Request;

class SalaController extends Controller
{
    public function index()
    { 
        return Sala::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $sala = Sala::create($request->all());

        return response()->json($sala, 201);
    }

    public function show(Sala $sala)
    {
        return $sala;
    }

    public function update(Request $request, Sala $sala)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $sala->update($request->all());

        return response()->json($sala, 200);
    }

    public function destroy(Sala $sala)
    {
        $sala->delete();

        return response()->json(null, 204);
    }
}

