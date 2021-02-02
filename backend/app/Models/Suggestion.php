<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Suggestion extends Model
{
    protected $table = 'game.suggestion';

    protected $primaryKey = 'suggestion_id';

    protected $fillable = [
        'suggestion_id', 'suggestion_type_id', 'user_id', 'text', 'phone', 'email', 'created_at', 'updated_at'
    ];

    public $timestamps = false;


    public function suggestion_type()
    {
    	return $this->belongsTo('App\Models\SuggestionType', 'suggestion_type_id', 'suggestion_type_id');
    }
    
    public function user()
    {
    	return $this->belongsTo('App\Models\User', 'user_id', 'user_id');
    }
}
