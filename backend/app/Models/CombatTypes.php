<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CombatTypes extends Model
{
    protected $table = 'game.combat_types';

    protected $primaryKey = 'combat_type_id';

    public $timestamps = false;

    protected $fillable = ["combat_type_id", "combat_type_name"];
}
