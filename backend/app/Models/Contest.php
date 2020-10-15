<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contest extends Model
{
  use SoftDeletes;
  
  protected $table = 'game.contests';

  protected $primaryKey = 'contest_id';

  const CREATED_AT = 'created_date';
  const UPDATED_AT = 'modified_date';

  protected $fillable = [
    "contest_uid",
    "user_id",
    "contest_name",
    "start_date",
    "end_date",
    "playoff_date",
    "season_id",
    "master_game_style_id",
    "status",
    "site_rake",
    "entry_fees",
    "size",
    "master_prize_id",
    "lineup_style",
    "draft_type",
    "projected_drafting_end_date",
    "draft_speed",
    "when_to_draft",
    "prize_pool",
    "is_private",
    "event_id",
    "master_game_style_id",
    "prediction_status",
  ];

  public function prize(){
    return $this->belongsTo('App\Models\MasterPrize', 'master_prize_id', 'master_prize_id');
  }

}
