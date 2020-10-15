<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContestUserPrime extends Model
{
  protected $table = 'game.contest_user_primes';

  protected $fillable = ['contest_id, user_id, team_name, total_score, status, joined_date, contest_user_prime_id'];

  public function contest(){
    return $this->belongsTo('App\Models\Contest', 'contest_id', 'contest_id');
  }

  public function user(){
    return $this->belongsTo('App\Models\User', 'user_id', 'user_id');
  }
}
