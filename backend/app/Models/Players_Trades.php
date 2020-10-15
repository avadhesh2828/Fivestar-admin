<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Players_Trades extends Model
{
    //

    protected $table = 'game.players_trades';

    protected $primaryKey = 'player_trades_id';

    protected $fillable = ['player_trades_id','player_id','buy_rate','sell_rate','reserve_price','total_share','status','created_date','modified_date'
	];

    public $timestamps = false;
}
