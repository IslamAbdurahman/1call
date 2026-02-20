<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('call_histories', function (Blueprint $table) {
            $table->id();
            $table->timestamp('date_time')->nullable();
            $table->string('src')->nullable();
            $table->string('dst')->nullable();
            $table->string('external_number')->nullable();
            $table->integer('duration')->default(0);
            $table->text('conversation')->nullable();
            $table->string('type')->nullable(); // inbound / outbound / internal
            $table->string('status')->nullable(); // answered / no-answer / busy / failed
            $table->string('recorded_file')->nullable();
            $table->string('linked_id')->nullable();
            $table->integer('event_count')->default(0);
            $table->string('module')->nullable();
            $table->string('auto_call_id')->nullable();
            $table->string('call_id')->nullable();
            $table->timestamps();

            // Performance indexes
            $table->index('date_time');
            $table->index('status');
            $table->index('type');
            $table->index('src');
            $table->index('dst');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_histories');
    }
};