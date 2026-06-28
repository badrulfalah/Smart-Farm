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
        Schema::create('dashboard', function (Blueprint $table) {
            $table->id('id_dashboard');
            $table->foreignId('id_peternakan')->constrained('peternakan', 'id_peternakan')->cascadeOnDelete();
            $table->integer('total_ternak')->default(0);
            $table->integer('ternak_sehat')->default(0);
            $table->integer('ternak_sakit')->default(0);
            $table->integer('jumlah_peringatan')->default(0);
            $table->decimal('stok_pakan', 12, 2)->default(0.00);
            $table->timestamp('terakhir_update')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard');
    }
};
