<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentWithdrawTransaction extends Model
{
  protected $table = 'finanace.payment_withdraw_transactions';

  public $timestamps = false;

  protected $primaryKey = 'payment_withdraw_transaction_id';

  protected $fillable = [
    'transaction_unique_id',
    'amount',
    'status',
    'created_date',
    'modified_date',
    'withdraw_type',
    'user_id',
  ];

  public function user()
	{
		return $this->belongsTo('App\Models\User','user_id','user_id');	
	}
}
