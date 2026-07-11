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
        Schema::create('stok_pakan', function (Blueprint $table) {
            $table->id('id_stok');
            $table->foreignId('id_peternakan')->constrained('peternakan', 'id_peternakan')->cascadeOnDelete();
            $table->foreignId('id_pakan')->constrained('jenis_pakan', 'id_pakan')->cascadeOnDelete();
            $table->decimal('jumlah', 12, 2);
            $table->decimal('stok_minimum', 12, 2);
            $table->timestamp('terakhir_update')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stok_pakan');
    }
};
