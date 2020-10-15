<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisment_model extends Model
{
     protected $table = 'users.ad_managements';
     protected $primaryKey = 'ad_management_id';
     protected $fillable = [
        'ads_unique_id', 'ad_name','target_url','image_adsense','ads_type','ad_position_id','view_count','click_count','status','ad_sequence','created_date','modified_date'
    	];
    public $timestamps = false;

    public function position()
	{
		return $this->hasOne('App\Models\Ad_position','ad_position_id','ad_position_id');
	}
}
