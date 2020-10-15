<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FighterPicks extends Model
{
    protected $table = 'game.fighter_picks';

    protected $primaryKey = 'fighter_pick_id';

    public $timestamps = true;

    protected $fillable = ["fighter_pick_id", "contest_id", "user_id", "match_id", "pick_winner_id", "score", "pick_victory_type", "pick_round", "result"];

    public function fighter()
    {
        return $this->hasOne('App\Models\Player', 'player_id', 'pick_winner_id');
    }

    public function victory_type()
    {
        return $this->hasOne('App\Models\VictoryTypes', 'victory_type_id', 'pick_victory_type');
    }

    public function device_token()
    {
        return $this->hasOne('App\Models\User', 'user_id', 'user_id')->select('device_token');
    }
    public function user()
    {
        return $this->hasOne('App\Models\User', 'user_id', 'user_id');
    }
}
