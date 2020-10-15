<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player_Team extends Model
{
    //

    protected $table = 'game.player_teams';

    protected $primaryKey = 'player_team_id';

    protected $fillable = ['player_team_id','player_id','team_id','status','season_id','created_date'
	];

    public $timestamps = false;


    public function team_detail()
    {
    	return $this->belongsTo('App\Models\Team','team_id','team_id');
    }

    public function session_detail()
    {
    	return $this->belongsTo('App\Models\Seasons','season_id','season_id');
    }
}
