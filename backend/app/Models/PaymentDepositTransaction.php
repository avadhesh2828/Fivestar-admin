<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentDepositTransaction extends Model
{
    protected $table = 'finanace.payment_deposit_transactions';

    public $timestamps = false;

    protected $primaryKey = 'payment_transaction_id';

    protected $fillable = [
        'payment_transaction_unique_id',
        'user_id',
        'payment_status',
        'payment_transaction_id',   
        'admin_id',
        'set_score',
        'befor_score',
        'after_score',
        'ip',
        'type',
        'date_created',
        'date_modified',
    ];

    public function account()
	{
		return $this->belongsTo('App\Models\Agent','admin_id','admin_id');	
	}
}
