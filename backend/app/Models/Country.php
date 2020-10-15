<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Common_model;

class Country extends Common_model
{
    //

    protected $table = 'users.master_countries';

    protected $primaryKey = 'master_country_id';

      protected $fillable = [
        'master_country_id','country_name','country_code','dial_code','currency_name','currency_symbol','currency_code'
    	];
}
