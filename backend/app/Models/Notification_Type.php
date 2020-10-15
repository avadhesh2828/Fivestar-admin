<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification_Type extends Model
{
    //
    protected $table = 'users.notification_types';
	protected $primaryKey = 'notification_type_id';
	const CREATED_AT = 'created_date';
	protected $fillable = [
		'notification_type_id','notification_type','title','description','status','users','default_action','created_date'
	];
}
