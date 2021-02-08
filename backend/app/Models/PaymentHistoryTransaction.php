<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentHistoryTransaction extends Model
{
    protected $table = 'finanace.payment_history_transactions';

    public $timestamps = false;

    protected $primaryKey = 'payment_history_transaction_id';

    protected $fillable = [
        'payment_history_transaction_id',
        'user_id',
        'description',
        'action',
        'ip',
        'game_id',
        'bet',
        'win',
        'begin_money',
        'end_money',
        'created_at',
        'updated_at'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'bet'         => 'decimal:2',
        'win'         => 'decimal:2',
        'begin_money' => 'decimal:2',
        'end_money'   => 'decimal:2'
    ];

    public function game_detail(){
        return $this->belongsTo('App\Models\Game', 'game_id', 'game_id');
    }

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
