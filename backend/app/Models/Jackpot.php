<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jackpot extends Model
{
    protected $table = 'game.jackpot';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'jackpot_value',
        'reset_value',
        'created_at',
        'updated_at'
    ];

    public $timestamps = false;
}
