<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User_Portfolio extends Model
{
    //

    protected $table = 'game.user_portfolio';

    protected $primaryKey = 'user_portfolio_id';

    protected $fillable = ['user_portfolio_id','user_id','player_id','buy_rate','shares_owns','created_date'
	];

    public $timestamps = false;
    
}
