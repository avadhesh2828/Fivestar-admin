<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuggestionType extends Model
{
    protected $table = 'game.suggestion_type';

    protected $primaryKey = 'suggestion_type_id';

    protected $fillable = [
        'suggestion_type_id', 'suggestion_name'
    ];

    public $timestamps = false;
}
