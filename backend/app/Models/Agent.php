<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $table = 'users.admins';

    protected $primaryKey = 'admin_id';

    protected $fillable = [
        'admin_id', 'email','role_id','status','password','updated_date','remember_token','parent_id','last_login','last_ip','phone','balance','description','name','username','created_at','updated_at','personal_password','unique_code'
    ];
    
    public $timestamps = false;
}