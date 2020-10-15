<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchPlayerScores extends Model
{
    protected $table = 'game.match_player_scores';
    // protected $primaryKey = 'player_unique_id';
     protected $fillable = [
        'player_unique_id', 'score','break_down','feed_match_statistics_id','team_id'
    	];
    public $timestamps = false;
}
