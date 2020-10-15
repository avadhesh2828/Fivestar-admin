<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Country;


class Common_model extends Model
{
    
    public static function get_all_countries(){
    	$countries = Country::OrderBy('country_name')->get();
    	return $countries;
    }

}
