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
        'payment_method',
        'user_id',
        'payment_request',
        'payer_id',
        'payer_email',
        'phone',
        'first_name',
        'last_name',
        'transaction_id',
        'order_time',
        'payment_status',
        'status',
        'added_to_user_balance',
        'date_created',
        'date_modified',
    ];
}
