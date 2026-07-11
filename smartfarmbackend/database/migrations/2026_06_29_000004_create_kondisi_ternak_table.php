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
        Schema::create('kondisi_ternak', function (Blueprint $table) {
            $table->id('id_kondisi');
            $table->foreignId('id_ternak')->constrained('ternak', 'id_ternak')->cascadeOnDelete();
            $table->timestamp('tanggal_pencatatan')->useCurrent();
            $table->decimal('suhu_tubuh', 5, 2);
            $table->decimal('berat', 8, 2);
            $table->string('nafsu_makan');
            $table->string('kondisi_fisik');
            $table->decimal('produksi', 8, 2)->nullable();
            $table->text('catatan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kondisi_ternak');
    }
};
