<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    //
  protected $table = 'users.user';

  protected $appends = ['name'];

  protected $primaryKey = 'user_id';

  const UPDATED_AT = 'modified_date';
  const CREATED_AT = 'created_date';

  protected $fillable = [
    'user_id', 'user_unique_id','first_name','last_name','user_name','email','password','balance','dob','status','status_reason','new_password_key','new_password_requested','last_login','last_ip','created_date','modified_date','opt_in_email','google_id','master_country_id','image','email_token','currency','address','timeout','timeout_added_at','winning_balance'
  ];

  protected $casts = [
      'status' => 'string',
  ];



  public $timestamps = false;

  public function admin()
  {
      return $this->belongsTo('App\Models\Admin');
  }

  public function getNameAttribute()
  {
      return ucfirst($this->first_name) . ' ' . ucfirst($this->last_name);
  }

  public function user_master_country()
  {
    return $this->belongsTo('App\Models\Country','master_country_id','master_country_id');
  }
  public function master_country()
  {
      return $this->belongsTo('App\Models\Country', 'master_country_id');

  }

  public function master_state()
  {
      return $this->belongsTo('App\Models\State','master_state_id','master_state_id');
  }

  public function get_transactions()
  {
      return $this->hasMany('App\Models\Transaction_model','user_id','user_id');
  }
}
