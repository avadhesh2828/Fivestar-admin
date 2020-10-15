<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    protected $table = 'game.page_contents';

    protected $primaryKey = 'page_content_id';
  
    protected $fillable = ["page_content_id", "page_title,", "page_description,", "created_at,", "updated_at,"];
}
