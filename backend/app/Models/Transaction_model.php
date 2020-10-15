<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction_model extends Model
{
    //

    // public $connection = "pgsql3";

	protected $table = 'finanace.payment_history_transactions';

	protected $primaryKey = 'payment_history_transaction_id';

	protected $fillable = [
        		   'user_id','gateway_transaction_id','amount','currency_code','gateway_customer_id','gateway_customer_global_id','created_date','payment_withdraw_transaction_id','description','is_processed','payment_type','payment_history_transaction_id','payment_for',
    	];

	 public $timestamps = false;    

	public function user()
	{
		return $this->belongsTo('App\Models\User','user_id','user_id');
		
	}



}
