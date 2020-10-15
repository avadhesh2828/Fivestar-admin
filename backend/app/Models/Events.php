<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Events extends Model
{
  use SoftDeletes;
  
    protected $table = 'game.events';

    protected $primaryKey = 'event_id';
  
    protected $fillable = ["event_name", "venue_name", "venue_address", "promotion_id", "venue_city", "venue_zipcode", "event_datetime"];

    public function event_opt_match(){
        return $this->hasMany('App\Models\EventOptMatch', 'event_id', 'event_id');
      }
}
