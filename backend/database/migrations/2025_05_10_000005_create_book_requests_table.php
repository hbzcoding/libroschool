<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('title');
            $table->string('isbn')->nullable()->index();
            $table->string('subject')->nullable()->index();
            $table->string('grade')->nullable()->index();
            $table->string('track')->nullable()->index();
            $table->decimal('max_price', 8, 2)->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('open'); // open, matched, closed, hidden
            $table->timestamps();

            $table->index(['buyer_id']);
            $table->index(['school_id']);
            $table->index(['status']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_requests');
    }
};
