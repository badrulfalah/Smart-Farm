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
        Schema::create('ternak', function (Blueprint $table) {
            $table->id('id_ternak');
            $table->foreignId('id_peternakan')->constrained('peternakan', 'id_peternakan')->cascadeOnDelete();
            $table->foreignId('id_jenis')->constrained('jenis_ternak', 'id_jenis')->cascadeOnDelete();
            $table->string('kode_ternak');
            $table->string('nama_ternak');
            $table->string('jenis_kelamin');
            $table->integer('umur');
            $table->decimal('berat', 8, 2);
            $table->string('status_kesehatan');
            $table->date('tanggal_masuk');
            $table->string('foto')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ternak');
    }
};
