<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WeightClasses extends Model
{
    use SoftDeletes;

    protected $table = 'game.weight_classes';

    protected $primaryKey = 'weight_class_id';
  
    public $timestamps = false;
  
    protected $fillable = ["weight_class_id", "weight_class_name", "min_weight", "max_weight", "discipline", "created_at", "updated_at"];
}
