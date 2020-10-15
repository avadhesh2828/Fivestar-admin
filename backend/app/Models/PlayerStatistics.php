<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerStatistics extends Model
{
    protected $table = 'game.player_statistics';
     protected $primaryKey = 'player_statistic_id';
     protected $fillable = [
        'player_id', 'submission','decision','ko','round','win','match_id','created_at','updated_at'
    	];
    public $timestamps = true;
}
