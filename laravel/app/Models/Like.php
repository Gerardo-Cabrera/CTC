<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $fillable = ['count', 'task_id'];
    public $timestamps = false;

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
