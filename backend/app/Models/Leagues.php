<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leagues extends Model
{

  protected $table = 'game.leagues';

  protected $primaryKey = 'league_id';

  protected $fillable = ['league_id','league_name','league_abbr','league_url_name','sport_id','status','league_sequence','feed_league_id','flag_url','logo','season_start_date','season_end_date','created_date'
  ];

  protected $appends = ['icon'];

  public $timestamps = false;


  public function mastersports()
  {
    return $this->belongsTo('App\Models\Master_sports','sport_id','sport_id')->where('status',1);
  }

  public function season(){
    return $this->hasOne('App\Models\Seasons', 'league_id', 'league_id');
  }

  public function getIconAttribute(){
    $icon = 'far fa-futbol';

    switch($this->league_url_name){
      case 'pga':
        $icon = 'fas fa-golf-ball';
      break;
    }

    return $icon;
  }

}
