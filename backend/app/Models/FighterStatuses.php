<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FighterStatuses extends Model
{
    protected $table = 'game.fighter_statuses';

    protected $primaryKey = 'fighter_status_id';
  
    public $timestamps = false;
  
    protected $fillable = ["fighter_status_id", "fighter_status_name"];
}
