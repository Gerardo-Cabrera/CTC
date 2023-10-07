<?php

use Illuminate\Http\Request;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\StateController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/tasks', [TaskController::class, 'index']);
Route::get('/tasks/by-name', [TaskController::class, 'getTasksByName']);
Route::get('/tasks/by-state', [TaskController::class, 'getTasksByState']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

Route::post('/tasks/{taskId}/likes', [LikeController::class, 'addLike']);
Route::get('/states', [StateController::class, 'index']);
Route::get('/tasks/{taskId}/likes', [LikeController::class, 'getLikesByTask']);
Route::put('/tasks/{taskId}/likes', [LikeController::class, 'updateLikesCount']);
