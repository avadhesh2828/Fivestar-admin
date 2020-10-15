<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterGameStyle extends Model
{
    protected $table = 'game.master_game_styles';
     protected $primaryKey = 'master_game_styles_id';
     protected $fillable = [
        'name', 'abbr','season_id','sequence','status'
    	];
    public $timestamps = false;
}
