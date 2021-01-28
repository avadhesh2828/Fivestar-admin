<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameType extends Model
{
    protected $table = 'game.game_type';

    protected $primaryKey = 'game_type_id';

    protected $fillable = [
        'game_type_id', 'game_type', 'description', 'image', 'is_active', 'redpacket_time', 'created_at', 'updated_at'
    ];

    public $timestamps = false;
}
