<?php

namespace App\Models;

use App\Events\LikeUpdated;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Like extends Model
{
    use HasFactory;

    protected $fillable = ['count', 'task_id'];
    public $timestamps = false;

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Add likes to a task.
     */
    public function addLike($taskId) {
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
}
