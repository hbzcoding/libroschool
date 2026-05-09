<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('school_id')->nullable()->constrained('schools')->nullOnDelete();
            $table->foreignId('classroom_id')->nullable()->constrained('classrooms')->nullOnDelete();
            $table->string('title');
            $table->string('subject')->nullable()->index();
            $table->string('grade')->nullable()->index();
            $table->longText('content')->nullable();
            $table->string('visibility')->default('private'); // public, private, classroom, specific_users
            $table->string('mode')->default('normal'); // normal, flashcard
            $table->timestamps();

            $table->index(['author_id']);
            $table->index(['school_id']);
            $table->index(['classroom_id']);
            $table->index(['visibility']);
            $table->index(['mode']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
