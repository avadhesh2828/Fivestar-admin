<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    protected $table = 'finanace.history';

    protected $primaryKey = 'history_id';

    protected $fillable = [
        'history_id',
        'action_for',
        'to_id',
        'from_id',
        'name',
        'description',
        'game_id',
        'win',
        'bet',
        'begin_money',
        'end_money',
        'set_score',
        'before_score',
        'after_score',
        'last_ip',
        'type',
        'payment_type',
        'created_at',
        'updated_at'
    ];

    public $timestamps = false;

    public function agent_detail(){
        return $this->belongsTo('App\Models\Agent', 'from_id', 'admin_id');
    }
}
