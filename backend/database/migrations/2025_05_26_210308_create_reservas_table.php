<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('sala_id')
                  ->nullable() 
                  ->constrained('salas')
                  ->onDelete('cascade');
            $table->dateTime('inicio');
            $table->dateTime('fin');            
            $table->enum('activa', ['activa', 'en_uso', 'liberada'])->default('activa');
            $table->timestamps();
        });
    }
    
    
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
