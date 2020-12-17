<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameProvider extends Model
{
    protected $table = 'game.game_provider';

    protected $primaryKey = 'provider_id';

    protected $fillable = [
        'provider_id', 'provider_name', 'language', 'created_at', 'updated_at'
    ];

    public $timestamps = false;
}