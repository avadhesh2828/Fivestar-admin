<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification_model extends Model
{
    //
	protected $table = 'users.notifications';
	protected $primaryKey = 'notification_id';
	const UPDATED_AT = 'updated_date';
	const CREATED_AT = 'created_date';
	protected $fillable = [
		'notification_id','notification_type_id','sender_user_id','receiver_user_id','title','notification','is_read','created_date','updated_date'
	];

}
