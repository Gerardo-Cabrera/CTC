<?php

namespace App\Http\Controllers;

use App\Events\LikeUpdated;
use App\Models\Like;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LikeController extends Controller
{
    /**
     * Insert likes to a task.
     */
    public function like($taskId) {
        try {            
            $like = Like::firstOrNew(['task_id' => $taskId]);
            $like->count = $like->count + 1;
            $like->save();
            $likesCount = Like::where('task_id', $taskId)->value('count');

            // Emit an event to report the like counter update.
            broadcast(new LikeUpdated($taskId, $likesCount));

            return response()->json(['count' => $likesCount, 'success' => true], 200);
        } catch (\Exception $e) {
            Log::error('Error al manejar el like: ' . $e->getMessage());
            return response()->json(['error' => 'Error al manejar el like'], 500);
        }
    }

    /**
     * Get likes of a task.
     */
    public function getLikesByTask($taskId)
    {
        // Get the likes for the specific task by its ID
        $likes = Like::where('task_id', $taskId)->pluck('count')->first();
        return response()->json(['likes' => $likes]);
    }

    /**
     * Update likes of a task.
     */
    public function updateLikesCount(Request $request, $taskId)
    {
        $request->validate([
            'count' => 'required|integer',
        ]);

        $like = Like::where('task_id', $taskId)->first();

        if ($like) {
            $like->update([
                'count' => $request->count,
            ]);
        } else {
            $like = new Like();
            $like->task_id = $taskId;
            $like->count = $request->count;
            $like->save();
        }

        return response()->json(['success' => true]);
    }
}
