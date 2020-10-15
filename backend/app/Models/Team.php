<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
  protected $table = 'game.teams';

  protected $primaryKey = 'team_id';

	//public $keyType = 'string';

	protected $casts = [
        'team_id' => 'integer',
        'logo'=>'string'
  ];

  protected $fillable = ['team_id','team_abbr','season_id','team_name','logo'
	];

	public $incrementing = false;

  public $timestamps = false;

  public function Seasons()
	{
		return $this->belongsTo('App\Models\Seasons','season_id','season_id');
	}
}
