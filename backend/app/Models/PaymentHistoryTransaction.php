<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentHistoryTransaction extends Model
{
    protected $table = 'finanace.payment_history_transactions';

    public $timestamps = false;

    protected $primaryKey = 'payment_history_transaction_id';

    protected $fillable = [
        'user_id',
        'amount',
        'gateway_customer_id',
        'payment_for',
        'created_date',
        'is_processed',
        'payment_type',
        'description',
        'payment_deposit_transaction_id',
    ];

    public function payment_deposit_transaction(){
        return $this->belongsTo('App\Models\PaymentDepositTransaction', 'payment_deposit_transaction_id', 'payment_transaction_id');
    }

    public function payment_withdraw_transaction(){
        return $this->belongsTo('App\Models\PaymentWithdrawTransaction', 'payment_withdraw_transaction_id', 'payment_withdraw_transaction_id');
    }

    public function user()
	{
		return $this->belongsTo('App\Models\User','user_id','user_id');
	}
}
