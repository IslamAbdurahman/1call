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
        Schema::create('trunks', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('host');
            $table->integer('port')->default(5060);
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('did')->nullable()->comment('The number assigned by provider');
            $table->string('transport')->default('transport-udp');
            $table->string('context')->default('from-external');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trunks');
    }
};
