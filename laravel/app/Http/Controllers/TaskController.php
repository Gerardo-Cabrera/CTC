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
        $likes = Like::where('task_id', $id)->pluck('count')->first();
        
        if ($likes == 0) {
            $task->delete();
            return response()->json(['message' => 'Tarea eliminada']);
        } else {
            return response()->json(['message' => 'No se puede eliminar una tarea con likes'], 400);
        }
    }

    /**
     * Search task or tasks by name.
     */
    public function getTasksByName(Request $request) {
        $taskName = $request->input('title');
        $tasks = Task::where('title','ilike', '%' .$taskName . '%')->get();
        return response()->json($tasks);
    }

    /**
     * Search tasks by state.
     */
    public function getTasksByState(Request $request) {
        $state = $request->input('state');
        $tasks = Task::where('state', $state)->get();
        return response()->json($tasks);
    }
}
