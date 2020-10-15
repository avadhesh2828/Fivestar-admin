<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User_Watchlist extends Model
{
    //

    protected $table = 'game.user_watchlist';

    protected $primaryKey = 'user_watchlist_id';

    protected $fillable = ['user_watchlist_id','user_id','player_id','previous_sell_rate','previous_buy_rate','created_date'
	];

    public $timestamps = false;
}
