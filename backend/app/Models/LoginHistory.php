<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginHistory extends Model
{
    protected $table = 'users.user_login_history';

    protected $primaryKey = 'user_login_history_id';

    protected $fillable = [
        'user_login_history_id', 'user_id', 'ip', 'created_at','updated_at'
    ];
    
    public $timestamps = false;
}