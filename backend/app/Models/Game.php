<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $table = 'game.game';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'name','type','num_reels','num_rows','num_selection','bet','image','status','provider_id','game_id', 'position', 'created_at','updated_at'
    ];

    public $timestamps = false;


    public function provider(){
        return $this->belongsTo('App\Models\GameProvider', 'provider_id', 'provider_id');
    }

}