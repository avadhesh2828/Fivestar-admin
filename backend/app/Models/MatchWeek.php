<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchWeek extends Model
{
  protected $table = "game.match_weeks";

  public function season()
  {
  	 return $this->belongsTo('App\Models\Seasons','season_id','season_id');
  }
}
