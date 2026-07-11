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
        Schema::create('peternakan', function (Blueprint $table) {
            $table->id('id_peternakan');
            $table->foreignId('id_pengguna')->constrained('pengguna', 'id_pengguna')->cascadeOnDelete();
            $table->string('nama_peternakan');
            $table->text('alamat')->nullable();
            $table->string('kota')->nullable();
            $table->string('provinsi')->nullable();
            $table->decimal('luas_lahan', 12, 2)->nullable();
            $table->timestamp('dibuat_pada')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peternakan');
    }
};
