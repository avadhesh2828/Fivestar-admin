<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Match_weeks extends Model
{
  protected $table = 'game.match_weeks';
  // protected $primaryKey = 'match_id';
  protected $fillable = ['match_type','match_week','start_date_time','end_date_time','close_date_time','season_id'];

  public $timestamps = false;

  public function Seasons()
  {
 	  return $this->belongsTo('App\Models\Seasons','season_id','season_id');
  }
}
