<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $table = 'game.game';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'name','type','num_reels','num_rows','num_selection','bet','image','status','created_at','updated_at'
    ];

    public $timestamps = false;

}