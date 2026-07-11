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
        Schema::create('peringatan', function (Blueprint $table) {
            $table->id('id_peringatan');
            $table->foreignId('id_ternak')->constrained('ternak', 'id_ternak')->cascadeOnDelete();
            $table->string('jenis_peringatan');
            $table->string('tingkat_peringatan');
            $table->text('pesan');
            $table->string('status');
            $table->timestamp('tanggal')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peringatan');
    }
};
