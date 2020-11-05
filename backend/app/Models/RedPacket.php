<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RedPacket extends Model
{
    protected $table = 'users.red_packet';

    protected $primaryKey = 'red_packet_id';

    protected $fillable = [
        'red_packet_id', 'min','max','drop_min_amount','drop_max_amount','drop_rates','game','status','created_at','updated_at'
    ];

    public $timestamps = false;
}