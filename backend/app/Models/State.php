<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class State extends Model
{
  protected $table = 'users.master_states';
  protected $primaryKey = 'master_state_id';
  protected $fillable = [
    'master_state_id', 'name','master_country_id'
	];
}
