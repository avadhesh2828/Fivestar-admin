<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ad_position extends Model
{
    //
		protected $table = 'users.ad_positions';

		protected $appends = ['ads_positions','ads_size'];

		protected $primaryKey = 'ad_position_id';

		protected $fillable = [
        	'ad_type', 'height','width','status','ad_sequence','created_date','modified_date'
    	];

    	public $timestamps = false;

    	public function getAdsPositionsAttribute() 
		{	
        	return $this->ad_type;
    	}

    	public function getAdsSizeAttribute()
    	{
    		return $this->width . '*' .$this->height;
    	}
}
