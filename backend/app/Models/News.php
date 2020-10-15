<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class News extends Model
{
    use SoftDeletes;

    protected $table = 'game.news';
     protected $primaryKey = 'news_id';
     protected $fillable = [
        'news_title', 'news_description','news_cover_image','is_featured','news_video_url','publication_date','created_at','updated_at'
    	];
    public $timestamps = true;

}
