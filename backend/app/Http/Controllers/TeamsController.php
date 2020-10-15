<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Models\Seasons;
use App\Models\Leagues;
use App\Models\Match;
use DB;
use Validator;

class TeamsController extends Controller
{
    //
  public function get_all_teams(Request $request)
  {
  	\DB::enableQueryLog();
  	$teams = new Team;
  	 // Eager load relationship
  	$teams = $teams->with('Seasons','Seasons.league');
  	$teams = $teams->whereHas('Seasons', function($q) use ($request){
			if(isset($request->league_id) && $request->league_id > -1)
		  {
		   	$teams = $q->where('league_id', $request->league_id);
		  }
  	});
  	$teams = $teams->paginate($request->per_page);
  	return response()->json(['response_code'=> 200,'service_name' => 'get_teams','data' => $teams,'message'=> 'get all teams']);
  }

  public function pre_team_data()
	{
		$result = array(
			"leagues" => $this->get_all_leagues(),
		);
		return response()->json(['response_code'=>200,'service_name' => 'get_teams','data'=>$result]);
	}
	public function get_all_leagues()
  {
	  $query = Leagues::with('mastersports')->where('status',1)->orderBy('league_sequence','ASC')->orderBy('league_name', 'ASC')->get();
    return $query;
  }

  //match detail
  public function match_details(Request $request)
  {
    $post_data = $request->post();
    $rules = [
      'match_unique_id'    => 'required'
    ];
    $validator = Validator::make($request->all(), $rules);
    if ($validator->fails())
    {
      $error = $validator->errors();
      $error_all = $validator->messages()->all();
      $message = $error_all[array_keys($error_all)[0]];
      return response()->json(['service_name' => 'get_match_details','global_error'=>$error],500);
    }
    $season_id = $post_data['match_unique_id'];
    if (empty($season_id)) {
    }
    else
    {
      $match_details = Match::from('game.matches as M');
      $match_details = $match_details->select('M.match_id','M.match_type','MS.sport_name','L.league_name','S.season_year','M.week','M.status','T1.team_name AS home_team', 'T1.team_abbr AS home_abbr','T1.logo AS home_team_logo','T2.team_name AS away_team','T2.team_abbr AS away_abbr','T2.logo AS away_team_logo','M.scheduled_date_time AS match_date','M.match_result');
      $match_details = $match_details->Join('game.seasons as S','S.season_id', '=', 'M.season_id');
      $match_details = $match_details->Join('game.leagues as L','L.league_id', '=', 'S.league_id');
      $match_details = $match_details->Join('game.master_sports as MS','MS.sport_id', '=', 'L.sport_id');
      $match_details->Join('game.teams as T1', function($q) {
                $q->on('T1.team_id', '=', DB::Raw('CAST("M"."home" AS int)'));
                $q->on('T1.season_id', '=','M.season_id');
      });
      $match_details->Join('game.teams as T2', function($q) {
                $q->on('T2.team_id', '=', DB::Raw('CAST("M"."away" AS int)'));
                $q->on('T2.season_id', '=','M.season_id');
      });
      $match_details = $match_details->where('match_unique_id',$season_id);
      $match_details = $match_details->first();

      return response()->json(['response_code'=>200,'service_name' => 'get_match_details','data'=>$match_details]);

    }
  }
}
