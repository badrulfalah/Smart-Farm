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
        Schema::create('pemberian_pakan', function (Blueprint $table) {
            $table->id('id_pemberian');
            $table->foreignId('id_ternak')->constrained('ternak', 'id_ternak')->cascadeOnDelete();
            $table->foreignId('id_pakan')->constrained('jenis_pakan', 'id_pakan')->cascadeOnDelete();
            $table->timestamp('tanggal')->useCurrent();
            $table->decimal('jumlah', 8, 2);
            $table->text('keterangan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemberian_pakan');
    }
};
