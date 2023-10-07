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
     * Add likes to a task.
     */
    public function addLike($taskId) {          
        $like = new Like;
        $likesCount = $like->addLike($taskId);
        return $likesCount;
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
