<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Player extends Model
{
    use SoftDeletes;

    protected $table = 'game.players';

    protected $primaryKey = 'player_id';

    // public $keyType = 'string';

    protected $casts = [
        'team_id' => 'integer',
    ];


    protected $appends = ['player_name','position'];

    protected $fillable = ['player_id','player_unique_id','position_abbr','jersey_number','injury_status','dob','weight','height_feet','height_inch','status','salary','position','player_image','first_name','last_name','full_name','en_full_name','position_type','season_id','team_id','team_abbr','nick_name','team_name','reach','stance','win','loss','draw','ko','sub','bio','promotion_id','player_status','gender','gym'
	];

    public $timestamps = false;

    public function getPlayerNameAttribute()
    {
       return  $this->full_name;
    }

    public function getPositionAttribute()
    {
       return  $this->position_abbr;
    }

    public function seasons_detail()
    {
        return $this->belongsTo('App\Models\Seasons','season_id','season_id');
    }

    public function team_detail()
    {
        return $this->belongsTo('App\Models\Team','team_id','team_id');
    }
    public function promotion()
    {
        return $this->hasOne('App\Models\Promotion','id','promotion_id');
    }
    public function fighter_status()
    {
        return $this->hasOne('App\Models\FighterStatuses','fighter_status_id','player_status');
    }




}
