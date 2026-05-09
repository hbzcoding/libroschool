<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->nullable();
            $table->string('name');
            $table->string('city')->nullable()->index();
            $table->string('province')->nullable()->index();
            $table->string('region')->nullable()->index();
            $table->string('country')->default('Italy');
            $table->string('school_type')->nullable()->index();
            $table->timestamps();

            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
