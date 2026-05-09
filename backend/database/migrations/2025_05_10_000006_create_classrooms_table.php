<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('grade');
            $table->string('section');
            $table->string('track')->nullable();
            $table->string('academic_year');
            $table->string('join_code')->unique();
            $table->string('join_policy')->default('code'); // open, code, approval
            $table->string('visibility')->default('private'); // public, private
            $table->boolean('is_verified')->default(false);
            $table->string('status')->default('active'); // active, reported, locked, deleted
            $table->timestamps();

            $table->index(['school_id']);
            $table->index(['owner_id']);
            $table->index(['academic_year']);
            $table->index(['grade']);
            $table->index(['section']);
            $table->index(['track']);
            $table->index(['status']);

            $table->unique(['school_id', 'academic_year', 'grade', 'section', 'track']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classrooms');
    }
};
