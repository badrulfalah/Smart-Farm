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
        Schema::create('tindakan_cepat', function (Blueprint $table) {
            $table->id('id_tindakan');
            $table->foreignId('id_peringatan')->constrained('peringatan', 'id_peringatan')->cascadeOnDelete();
            $table->string('tindakan');
            $table->string('penanggung_jawab');
            $table->string('status');
            $table->timestamp('tanggal_tindakan')->useCurrent();
            $table->text('catatan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tindakan_cepat');
    }
};
