<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Country;
use App\Models\Common_model;
use App\Models\Leagues;
use App\Models\GameStyle;
use App\Models\Promotion;
use App\Models\Events;
use App\Models\MasterGameStyle;
use App\Models\CombatTypes;
use App\Models\VictoryTypes;
use App\Models\GameType;

class CommonController extends Controller
{
  public function get_category(Request $request){
      $category = GameType::get();
      return response()->json(['response_code'=> 200,'service_name' => 'get_category','data' => $category]);
  }
}
