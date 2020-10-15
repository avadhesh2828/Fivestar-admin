<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Match extends Model
{
  use SoftDeletes;

  protected $table = 'game.matches';


  protected $primaryKey = 'match_id';

  protected $fillable = ['season_id','match_unique_id','match_type','week','feed_scheduled_date_time','scheduled_date_time','home','away','status','status_description','match_result','feed_week','match_id','end_date_time','tournament_name','home_status','away_status','weight_class_id','championship','preview_id','review_id','title_fight','main_event','combat_type_id','round','home_point','away_point'];

  // protected $appends = ['home_id', 'away_id'];

  // protected $hidden = ['home', 'away'];

  // protected $casts = [
  //   'home' => 'integer',
  //   'away' => 'integer'
  //   ];

  // public function castHomeToInt($value)
  // {
  //     return (int)$value;
  // }

  // public function castAwayToInt($value)
  // {
  //     return (int)$value;
  // }

  public $timestamps = false;

   public function getHomeIdAttribute()
  {
      return $this->home;
  }

   public function getAwayIdAttribute()
  {
      return $this->away;
  }

  public function season_match()
  {
  	 return $this->belongsTo('App\Models\Seasons','season_id','season_id');
  }
  public function match_teams_home()
  {
  	return $this->hasOne('App\Models\Team','team_id','home')->select('team_name as home_name','team_abbr as home_abbr','logo as home_logo','team_abbr as home_abbr','team_name as home');
  }

  public function match_teams_away()
  {
  	return $this->hasOne('App\Models\Team','team_id','away')->select('team_name as away_name','team_abbr as away_abbr','logo as away_logo','team_abbr as away_abbr','team_name as away');
  }

  public function match_player()
  {
    return $this->belongsTo('App\Models\Player','season_id','season_id')->with('team_detail');
  }
}
