<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('title');
            $table->string('isbn')->nullable()->index();
            $table->string('subject')->nullable()->index();
            $table->string('grade')->nullable()->index();
            $table->string('track')->nullable()->index();
            $table->string('publisher')->nullable();
            $table->string('author')->nullable();
            $table->string('condition'); // new, very_good, good, acceptable
            $table->decimal('price', 8, 2);
            $table->text('description')->nullable();
            $table->string('status')->default('available'); // available, reserved, sold, hidden
            $table->timestamps();

            $table->index(['seller_id']);
            $table->index(['school_id']);
            $table->index(['status']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
