<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookRequestController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\SchoolController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'libroschool-api',
    ]);
});

// Auth routes (public, rate limited)
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Auth routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
});

// Schools routes (public list/show)
Route::get('/schools', [SchoolController::class, 'index']);
Route::get('/schools/{school}', [SchoolController::class, 'show']);

// Schools routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/schools', [SchoolController::class, 'store']);
});

// Books routes (public list/show)
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);

// Books routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{book}', [BookController::class, 'update']);
    Route::delete('/books/{book}', [BookController::class, 'destroy']);
    Route::post('/books/{book}/mark-reserved', [BookController::class, 'markReserved']);
    Route::post('/books/{book}/mark-sold', [BookController::class, 'markSold']);
    Route::post('/books/{book}/images', [BookController::class, 'uploadImage']);
});

// Book requests routes (public list/show)
Route::get('/book-requests', [BookRequestController::class, 'index']);
Route::get('/book-requests/{bookRequest}', [BookRequestController::class, 'show']);

// Book requests routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/book-requests', [BookRequestController::class, 'store']);
    Route::put('/book-requests/{bookRequest}', [BookRequestController::class, 'update']);
    Route::delete('/book-requests/{bookRequest}', [BookRequestController::class, 'destroy']);
    Route::post('/book-requests/{bookRequest}/close', [BookRequestController::class, 'close']);
});

// Conversations routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);
});
