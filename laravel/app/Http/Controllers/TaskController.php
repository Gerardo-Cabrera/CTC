<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Display a listing of all tasks.
     */
    public function index()
    {
        $tasks = Task::all();
        return response()->json($tasks);
    }

    /**
     * Store a newly created a new task.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'date' => 'required',
            'state' => 'required',
            'creator' => 'required',
        ]);

        $task = Task::create($data);

        return response()->json($task, 201);
    }

    /**
     * Remove the specified task.
     */
    public function destroy(string $id)
    {
        $task = Task::findOrFail($id);
        
        if ($task->likes()->count() === 0) {
            $task->delete();
            return response()->json(['message' => 'Tarea eliminada']);
        } else {
            return response()->json(['message' => 'No se puede eliminar una tarea con likes'], 400);
        }
    }
}
