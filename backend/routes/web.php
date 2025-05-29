<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-email', function () {
    Mail::raw('Este es un correo de prueba desde Laravel usando Brevo SMTP.', function ($message) {
        $message->to('al05-018-0321@utdelacosta.edu.mx') 
                ->subject('Correo de prueba');
    });

    return 'Correo enviado';
});
