<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1. Users jadvaliga yangi ustunlar qo'shamiz
        Schema::table('users', function (Blueprint $table) {
            $table->string('extension')->nullable()->unique()->after('email');
            $table->foreignId('group_id')->nullable()->after('extension')->constrained()->nullOnDelete();
        });

        // 2. Ma'lumotlarni o'tkazish (Tinkerda qilganimizdek)
        if (Schema::hasTable('operators')) {
            $operators = DB::table('operators')->get();
            foreach ($operators as $op) {
                if ($op->user_id) {
                    DB::table('users')->where('id', $op->user_id)->update([
                        'extension' => $op->extension,
                        'group_id' => $op->group_id
                    ]);
                }
            }
        }

        // 3. Bog'langan jadvallardagi operator_id ni user_id ga o'tkazish
        // PostgreSQL uchun CASCADE bilan o'chiramiz
        DB::statement('DROP TABLE IF EXISTS operators CASCADE');
    }

    public function down(): void
    {
    }
};
