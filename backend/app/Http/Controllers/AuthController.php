<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Autentica a un usuario utilizando email y contraseña.
     *
     * Si las credenciales son válidas, se genera y devuelve un token JWT.
     *
     * @param Request $request Los datos de inicio de sesión (email y password).
     * @return \Illuminate\Http\JsonResponse Retorna el token y el ID del usuario autenticado o un error de autenticación.
     */
    public function login(Request $request)
    {
        // Extrae las credenciales del request
        $credentials = $request->only('email', 'password');
    
        // Intenta autenticar con las credenciales. Si falla, retorna 401 (Unauthorized)
        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        // Si es exitoso, retorna el JWT y el ID del usuario autenticado
        return response()->json([
            'token' => $token,      // Token JWT válido
            'user_id' => auth()->id() // ID del usuario autenticado
        ]);
    }
}

