<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    /**
     * Obtiene todos los usuarios del sistema.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $usuarios = User::all(); 
        return response()->json($usuarios);
    }

    /**
     * Crea un nuevo usuario.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $usuario = User::create([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return response()->json($usuario, 201);
    }

    /**
     * Actualiza la información de un usuario existente.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $usuario->name = $request->name;
        $usuario->email = $request->email;

        if ($request->filled('password')) {
            $usuario->password = bcrypt($request->password);
        }

        $usuario->save();

        return response()->json($usuario);
    }

    /**
     * Elimina un usuario por ID.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado con éxito']);
    }

    /**
     * Obtiene el nombre y correo electrónico de un usuario específico.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerUsuario($id)
    {
        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        return response()->json([
            'name' => $usuario->name,
            'email' => $usuario->email
        ]);
    }
}
