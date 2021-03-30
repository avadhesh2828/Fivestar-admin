<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
  protected $table = 'users.user';

  protected $primaryKey = 'user_id';

  protected $fillable = [
    'user_id', 'user_unique_id','username','email','password','balance','dob','status','last_login','last_ip','image','parent_id','phone','description','name','created_at','updated_at'
  ];

  public $timestamps = false;

  public function admin()
	{
		return $this->belongsTo('App\Models\Admin','parent_id','admin_id');	
	}

//   public function admin()
//   {
//       return $this->belongsTo('App\Models\Admin');
//   }

//   public function getNameAttribute()
//   {
//       return ucfirst($this->first_name) . ' ' . ucfirst($this->last_name);
//   }

//   public function user_master_country()
//   {
//     return $this->belongsTo('App\Models\Country','master_country_id','master_country_id');
//   }
//   public function master_country()
//   {
//       return $this->belongsTo('App\Models\Country', 'master_country_id');

//   }

//   public function master_state()
//   {
//       return $this->belongsTo('App\Models\State','master_state_id','master_state_id');
//   }

//   public function get_transactions()
//   {
//       return $this->hasMany('App\Models\Transaction_model','user_id','user_id');
//   }
}
