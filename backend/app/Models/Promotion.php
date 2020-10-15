<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Promotion extends Model
{
    use SoftDeletes;

    protected $table = 'game.promotions';
     protected $primaryKey = 'id';
     protected $fillable = [
        'name','created_at','updated_at'
    	];
    //public $timestamps = false;
}
