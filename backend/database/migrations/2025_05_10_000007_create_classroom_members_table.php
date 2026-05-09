<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classroom_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role')->default('member'); // owner, moderator, member
            $table->string('status')->default('active'); // active, pending, banned
            $table->timestamps();

            $table->unique(['classroom_id', 'user_id']);
            $table->index(['classroom_id']);
            $table->index(['user_id']);
            $table->index(['role']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_members');
    }
};
