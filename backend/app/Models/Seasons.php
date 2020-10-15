<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seasons extends Model
{
    //

    protected $table = 'game.seasons';

    protected $primaryKey = 'season_id';

    protected $fillable = ['season_id','season_year','league_id','season_start_date','season_end_date','created_date'
		];

    public $timestamps = false;

    public function league()
    {
    	return $this->belongsTo('App\Models\Leagues','league_id','league_id');
    }

}
