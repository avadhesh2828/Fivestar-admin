<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventOptMatch extends Model
{
  use SoftDeletes;
  
  protected $table = 'game.event_opt_matches';

  protected $primaryKey = 'event_opt_match_id';

  public $timestamps = false;

  protected $fillable = ["event_id", "match_id"];
}
