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
        Schema::create('riwayat_aktivitas', function (Blueprint $table) {
            $table->id('id_aktivitas');
            $table->foreignId('id_pengguna')->constrained('pengguna', 'id_pengguna')->cascadeOnDelete();
            $table->string('aktivitas');
            $table->string('modul');
            $table->timestamp('waktu')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_aktivitas');
    }
};
