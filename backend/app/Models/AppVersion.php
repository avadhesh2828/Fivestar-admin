<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppVersion extends Model
{
    protected $table = 'users.app_version';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'version','created_at','updated_at'
    ];

    public $timestamps = false;
}