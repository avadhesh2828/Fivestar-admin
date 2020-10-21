<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminRoles extends Model
{
    protected $table = 'users.admin_roles';

    protected $primaryKey = 'role_id';

    protected $fillable = [
        'role_id','namr','description'
    ];
    
    public $timestamps = false;
}