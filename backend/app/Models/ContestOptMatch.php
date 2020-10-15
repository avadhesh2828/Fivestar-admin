<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContestOptMatch extends Model
{
  protected $table = 'game.contest_opt_matches';

  protected $primaryKey = 'contest_opt_match_id';

  public $timestamps = false;

  protected $fillable = ["contest_id", "match_id"];
}
