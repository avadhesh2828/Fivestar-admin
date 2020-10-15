<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Master_sports extends Model
{
    protected $table = 'game.master_sports';

    protected $primaryKey = 'sport_id';

    protected $fillable = ['sport_id','sport_name','sport_sequence','status','created_date','modified_date'
		];

    public $timestamps = false;
}
