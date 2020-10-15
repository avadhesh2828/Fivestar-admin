<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dividends extends Model
{
    //

    protected $table = 'game.dividends';

    protected $primaryKey = 'dividend_id';

    protected $fillable = ['dividend_id','player_id','prev_number_of_shares','curr_number_of_shares','perc_per_share','status','created_date'
	];

    public $timestamps = false;
}
