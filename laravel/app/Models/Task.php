<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'date', 'state', 'creator'];
    public $timestamps = false;

    public function likes()
    {
        return $this->hasMany(Like::class);
    }
}
