<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchStatistics extends Model
{
    protected $table = 'game.match_statistics';
     protected $primaryKey = 'match_statistic_id';
     protected $fillable = [
        'match_id', 'home_stats','away_stats','created_at','updated_at'
    	];
    public $timestamps = true;
}
