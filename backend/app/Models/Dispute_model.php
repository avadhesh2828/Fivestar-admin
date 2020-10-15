<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispute_model extends Model
{
    protected $table = 'game.disputes';

    protected $primaryKey = 'dispute_id';

    protected $fillable = ['dispute_id','contest_id','user_id','dispute_message','status','created_date','modified_date',
	];

    public $timestamps = false;

    public function users()
    {
    	return $this->belongsTo('App\Models\User', 'user_id');
    }

    public function contest()
    {
    	 return $this->belongsTo('App\Models\Contest','player_id','player_id');
    }
}
