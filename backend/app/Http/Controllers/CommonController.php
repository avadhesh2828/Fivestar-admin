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


  public function country_list(Request $request)
  {
    $all_country = Country::get_all_countries();

    return response()->json(['status'=>'susscss','result'=>$all_country]);
  }

  public function victory_type_list(Request $request)
  {
    $victory_type = VictoryTypes::get();

    return response()->json(['status'=>'susscss','data'=>$victory_type]);
  }

  public function get_leagues(){
    $leagues = Leagues::with(['season'])->get();

    if( $leagues->count() > 0 ){

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'get_leagues',
        'data' => $leagues,
        'total' => $leagues->count(),
        'message'=> 'Leagues Fetched',
      ]);

    }

    return response()->json([
      'response_code'=> 404,
      'service_name' => 'get_leagues',
      'global_error'=> 'No leagues found',
    ], 404);
  }

  public function get_game_styles($season_id){

    $gameStyles = GameStyle::where('season_id', $season_id)
    ->where('status', 1)
    ->get();

    if( $gameStyles->count() > 0 ){

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'get_game_styles',
        'data' => $gameStyles,
        'message'=> 'Pre Data Fetched',
      ]);

    }

    return response()->json([
      'response_code'=> 404,
      'service_name' => 'get_game_styles',
      'global_error'=> 'No game styles found',
    ], 404);
  }

  public function get_league($league_id){

    if( $league = Leagues::where('league_id', $league_id)->with(['season'])->first() ){

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'get_league',
        'data' => $league,
        'message'=> 'League Fetched',
      ]);

    }

    return response()->json([
      'response_code'=> 404,
      'service_name' => 'get_league',
      'global_error'=> 'No league found',
    ], 404);
  }

  public function get_game_style($master_game_style_id){

    if( $gameStyle = GameStyle::where('master_game_styles_id', $master_game_style_id)
    ->where('status', 1)
    ->first() ){

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'get_game_style',
        'data' => $gameStyle,
        'message'=> 'Game Style Fetched',
      ]);

    }

    return response()->json([
      'response_code'=> 404,
      'service_name' => 'get_game_style',
      'global_error'=> 'No game style found',
    ], 404);
  }

  public function get_sizes($league, $gameStyle){
    $sizes = [];

    switch( $league ){
      case 'nfl':
        switch($gameStyle){
          case 'championship':
            $sizes = [
              [
                "name" => "Multiplayer",
                "abbr" => "multiplayer"
              ]
            ];
          break;
        }
      break;
      case 'pga':
        switch($gameStyle){
          case 'championship':
            $sizes = [
              [
                "name" => "Multiplayer",
                "abbr" => "multiplayer"
              ]
            ];
          break;
        }
      break;
    }

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'get_size',
      'data' => $sizes,
      'message'=> 'Sizes Fetched',
    ]);

  }
  public function promotion_list(){

    $promotion = Promotion::all();

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'get_promotion',
        'data' => $promotion,
        'message'=> 'promotion Data Fetched',
      ]);
  }

  public function combat_types(){

    $combatTypes = CombatTypes::all();

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'get_combat_types',
        'data' => $combatTypes,
        'message'=> 'Combat Types Data Fetched',
      ]);
  }

  public function get_event_list( Request $request){
    \DB::enableQueryLog();
      $all_events = new Events;
      $all_events = $all_events->select('event_name','event_id');
      // Partial Keyword Search Filter with player name
      if($request->keyword != "" )
      {
          $all_events = $all_events->where('event_name','ilike', '%'.$request->keyword.'%');
      }
      $all_events = $all_events->orderBy('created_at','DESC')->get();
      return response()->json(['response_code'=> 200,'service_name' => 'event_list','data' => $all_events]);
  }

  public function get_game_style_list( Request $request){
    \DB::enableQueryLog();
      $masterGameStyle = new MasterGameStyle;
      $masterGameStyle = $masterGameStyle->select('master_game_styles_id','name');
      $masterGameStyle = $masterGameStyle->where('status',1);
      $masterGameStyle = $masterGameStyle->orderBy('name','ASC')->get();
      return response()->json(['response_code'=> 200,'service_name' => 'event_list','data' => $masterGameStyle]);
  }
}
