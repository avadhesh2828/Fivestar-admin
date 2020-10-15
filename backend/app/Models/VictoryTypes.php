<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VictoryTypes extends Model
{
    protected $table = 'game.victory_types';

    protected $primaryKey = 'victory_type_id';
  
    public $timestamps = false;
  
    protected $fillable = ["victory_type_id", "victory_type_name"];
}
