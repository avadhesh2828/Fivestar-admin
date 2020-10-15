<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Match;
use App\Models\Leagues;
use App\Models\Seasons;
use App\Models\Team;
use App\Models\Match_weeks;
use App\Models\WeightClasses;
use App\Models\News;
use App\Models\MatchStatistics;
use App\Models\PlayerStatistics;
use App\Models\MatchPlayerScores;
use App\Models\FighterPicks;
use App\Models\EventOptMatch;
use App\Models\Notification_model;
use App\Models\User;
use App\Models\Player;
use App\Models\VictoryTypes;
use App\Helpers\Notification;
use Config;
use Validator;
use DB;

class MatchController extends Controller
{
	//get all season matches
	public function get_all_season_schedule(Request $request)
	{
    DB::enableQueryLog();
    $all_matches = DB::table('game.matches as M');
    //$all_matches = Match::from('game.matches as M');
		$all_matches = $all_matches->select('M.match_unique_id','M.match_id','M.match_result as result','M.scheduled_date_time','M.feed_week as week', 'M.home as home_id', 'M.away as away_id', 'M.home_point', 'M.away_point','PH.first_name as home_fighter_first_name','PH.last_name as home_fighter_last_name','PH.nick_name as home_fighter_nick_name','PH.player_image as home_fighter_player_image','PA.first_name as away_fighter_first_name', 'PA.last_name as away_fighter_last_name','PA.nick_name as away_fighter_nick_name','PA.player_image as away_fighter_player_image','M.status','CT.combat_type_name','M.round', 'MS.match_statistic_id');

		  //$all_matches = $all_matches->Join('game.seasons as S','S.season_id', '=', 'M.season_id');
    //   $all_matches = $all_matches->Join('game.leagues as L','L.league_id', '=', 'S.league_id');
    $all_matches = $all_matches->Join('game.combat_types as CT','CT.combat_type_id', '=', 'M.combat_type_id');
      $all_matches->Join('game.players as PH', function($q) {
                $q->on('PH.player_id', '=', DB::Raw('CAST("M"."home" AS int)'));
                // $q->on('TH.season_id', '=','M.season_id');
      });
      $all_matches->Join('game.players as PA', function($q) {
                $q->on('PA.player_id', '=', DB::Raw('CAST("M"."away" AS int)'));
                // $q->on('TA.season_id', '=','M.season_id');
      });
      $all_matches = $all_matches->leftJoin('game.match_statistics as MS','MS.match_id', '=', 'M.match_id');
      $all_matches = $all_matches->whereNull('M.deleted_at');
      $all_matches = $all_matches->orderBy('M.scheduled_date_time','DESC');

		// 	if(isset($request->league_id) && $request->league_id > -1)
		//   {
		//    	$all_matches = $all_matches->where('S.league_id', $request->league_id);
		//   }

		//   if(isset($request->team_id) && $request->team_id > -1) {
		// 		$all_matches->where(function($query) use ($request){
	    //       $query->where('TH.team_id',$request->team_id);
		// 			  $query->orWhere('TA.team_id',$request->team_id);
		// 	});
		// 	}

		// 	if(isset($request->week) && $request->week > -1)
		//   {
		//    	$all_matches = $all_matches->where('week', $request->week);
		//   }
	   // Date Range Filter
    // $dates = json_decode($request->dates);
    // if( isset($dates->fromdate) && isset($dates->todate) ){
    //   $all_matches = $all_matches->whereBetween('scheduled_date_time', [$dates->fromdate , $dates->todate]);
    // }
    $all_matches = $all_matches->paginate($request->per_page);

    // $query = DB::getQueryLog();
    // print_r($query);
		return response()->json(['service_name' =>'get_all_matches','data' => $all_matches],200);
	}

	//get all league
	public function get_all_league()
	{
		$query = Leagues::with('mastersports')->where('status',1)->orderBy('league_sequence','ASC')->orderBy('league_name', 'ASC')->get();
		$total = $query->count();
		$results['results'] = $query;
		$results['total'] = $total;
    return response()->json(['service_name' => 'get_all_leagues','data'=>$results],200);
	}

	//get all teams
	public function get_all_team(Request $request)
	{
		$league_id = $request->post('league_id');
		$all_teams = new Team;
		$all_teams = $all_teams->with('Seasons','Seasons.league');
		$all_teams = $all_teams->whereHas('Seasons.league', function($q) use ($request){
		if(isset($request->league_id) && $request->league_id > -1)
		  {
		   	$all_teams = $q->where('league_id', $request->league_id);
		  }
  	});
		$all_teams = $all_teams->orderBy('team_name','ASC');
		$all_teams = $all_teams->get();
		return response()->json(['service_name'=>'get_all_teams','data'=>$all_teams],200);
	}

	//get_all_week
	public function get_all_week(Request $request)
	{
		$all_week = new Match_weeks;
		$all_week = $all_week->select('match_week as match_week');
		$all_week = $all_week->with('Seasons','Seasons.league');
		$all_week = $all_week->whereHas('Seasons.league', function($q) use ($request){
			if(isset($request->league_id) && $request->league_id > -1)
		  {
		   	$all_week = $q->where('league_id', $request->league_id);
		   	$all_week = $q->where('status',1);
		  }
  	});
  	$all_week = $all_week->orderBy('match_week', 'ASC');
  	$all_week = $all_week->get();
  	return response()->json(['service_name'=>'get_all_week','data'=>$all_week],200);
	}

	//get match player
	public function get_match_players(Request $request)
	{
	 	$rules = [
      'match_unique_id'    => 'required'
    ];
    $validator = Validator::make($request->all(), $rules);
    if ($validator->fails())
    {
      $error = $validator->errors();
      $error_all = $validator->messages()->all();
      $message = $error_all[array_keys($error_all)[0]];
      return response()->json(['service_name' => 'get_match_players','global_error'=>$error],500);
    }

    $all_match_player  = DB::table('game.matches as M');
    $all_match_player->select('P.player_unique_id', 'P.player_unique_id', 'P.position_abbr as position', 'P.position_type', 'P.full_name as player_name', 'T.team_abbr', 'T.team_name', 'P.salary', 'P.team_id','M.match_id');
     	$all_match_player->Join('game.teams as T', function($q) {
                $q->on('T.team_id', '=', DB::Raw('CAST("M"."home" AS int)'));
                $q->Oron('T.team_id', '=', DB::Raw('CAST("M"."away" AS int)'));
      });
    $all_match_player->Join('game.players as P', function($q) {
                $q->on('T.team_id', '=', 'P.team_id');
                $q->on('P.season_id', '=', 'M.season_id');
    });
		if(isset($request->team_name) && $request->team_name != '') {
			  $all_match_player->where('T.team_name', $request->team_name);
		}
 		if(isset($request->position) && $request->position != '') {
			  $all_match_player->where('P.position_abbr', $request->position);
		}
		if(isset($request->position_type) && $request->position_type != '') {
			  $all_match_player->where('P.position_type', $request->position_type);
		}
		if(isset($request->playerName) && $request->playerName != "") {
				$all_match_player->where(function($query) use ($request){
	      $query->where('P.full_name', 'ilike', '%' . $request->playerName . '%');
	   		});
		}

   $all_match_player->where('M.match_unique_id', $request->match_unique_id);
   $all_match_player->where('P.status', 1);
   $all_match_player_array = $all_match_player->get()->toArray();
   $all_match_player = $all_match_player->paginate($request->per_page);


    $teams = array_values(array_unique(array_column($all_match_player_array, 'team_name')));
    $positions = array_values(array_unique(array_column($all_match_player_array, 'position')));
    $position_type = array_values(array_unique(array_column($all_match_player_array, 'position_type')));
    return response()->json(['service_name'=>'get_match_players','data'=>$all_match_player,'teams'=>$teams,'positions'=>$positions,'position_type'=>$position_type],200);

	}

    public function create_match(Request $request)
    {
        $data  = $request->post();
        //print_r($data); die;
        $error = array();
        $rules = [];
        $rules['scheduled_date'] = 'required';
        $rules['combat_type'] = 'required';
        $rules['home_fighter'] ='required';
        // $rules['home_fighter_status'] ='required';
        $rules['away_fighter'] ='required';
        // $rules['away_fighter_status'] ='required';
        $rules['weight_class_id'] ='required';
        $rules['championship'] ='required';
        $rules['title_fight'] ='required';
        $rules['main_event'] ='required';
        $rules['round'] ='required';
        $rules['home_point'] ='required';
        $rules['away_point'] ='required';
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails())
        {
            $error = $validator->errors();
            $error_all = $validator->messages()->all();
            $message = $error_all[array_keys($error_all)[0]];
           return response()->json(['message'=>$message],500);
        }
        else
        {
            $post_data = array(
                'match_unique_id'            => random_string('alnum',9),
                'combat_type_id'                  =>$data['combat_type'],
                'scheduled_date_time'        =>$data['scheduled_date'],
                'match_type'                 =>'REG',
                'home'                       => $data['home_fighter'],
                'away'                       => $data['away_fighter'],
                // 'away_status'                => $data['away_fighter_status']
                'weight_class_id'            => $data['weight_class_id'],
                'championship'               => $data['championship'],
                //'championship'               => $data['championship'],
                'preview_id'                 => $data['preview_id'],
                'review_id'                  => $data['review_id'],
                'title_fight'                => $data['title_fight'],
                'main_event'                 => $data['main_event'],
                'round'                      => $data['round'],
                'home_point'                 => $data['home_point'],
                'away_point'                 => $data['away_point'],
            );

            // return $post_data;
            $match = Match::create($post_data);
            if($match)
            {
                return response()->json(['message'=>'fight created successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }

        }
    }

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
    $match_unique_id = $post_data['match_unique_id'];
    if (empty($match_unique_id)) {
    }
    else
    {
      //$match_details = Match::from('game.matches as M');
      $match_details = DB::table('game.matches as M');
      $match_details = $match_details->select('M.match_unique_id','M.match_id','M.home_point','M.away_point','M.match_result as result','M.scheduled_date_time','PH.first_name as favourite_fighter_first_name','PH.last_name as favourite_fighter_last_name','PH.nick_name as favourite_fighter_nick_name','PH.player_image as favourite_fighter_player_image','PA.first_name as underdog_fighter_first_name', 'PA.last_name as underdog_fighter_last_name','PA.nick_name as underdog_fighter_nick_name','PA.player_image as underdog_fighter_player_image','M.status','CT.combat_type_name as combat_type','M.championship','M.title_fight','M.main_event','M.weight_class_id','WC.weight_class_name','M.preview_id','NP.news_title as preview_name','M.review_id','NR.news_title as review_name','M.round');
    //   $match_details = $match_details->Join('game.seasons as S','S.season_id', '=', 'M.season_id');
    //   $match_details = $match_details->Join('game.leagues as L','L.league_id', '=', 'S.league_id');
    //   $match_details = $match_details->Join('game.master_sports as MS','MS.sport_id', '=', 'L.sport_id');
    //   $match_details->Join('game.teams as T1', function($q) {
    //             $q->on('T1.team_id', '=', DB::Raw('CAST("M"."home" AS int)'));
    //             $q->on('T1.season_id', '=','M.season_id');
    //   });
    //   $match_details->Join('game.teams as T2', function($q) {
    //             $q->on('T2.team_id', '=', DB::Raw('CAST("M"."away" AS int)'));
    //             $q->on('T2.season_id', '=','M.season_id');
    //   });
      $match_details->Join('game.players as PH', function($q) {
        $q->on('PH.player_id', '=', DB::Raw('CAST("M"."home" AS int)'));
        // $q->on('TH.season_id', '=','M.season_id');
        });
        $match_details->Join('game.players as PA', function($q) {
                $q->on('PA.player_id', '=', DB::Raw('CAST("M"."away" AS int)'));
                // $q->on('TA.season_id', '=','M.season_id');
        });
        $match_details = $match_details->leftJoin('game.weight_classes as WC','WC.weight_class_id', '=', 'M.weight_class_id');
        $match_details = $match_details->leftJoin('game.news as NP','NP.news_id', '=', 'M.preview_id');
        $match_details = $match_details->leftJoin('game.news as NR','NR.news_id', '=', 'M.review_id');
        $match_details = $match_details->Join('game.combat_types as CT','CT.combat_type_id', '=', 'M.combat_type_id');
      $match_details = $match_details->where('match_unique_id',$match_unique_id);
      $match_details = $match_details->first();

      return response()->json(['response_code'=>200,'service_name' => 'get_match_details','data'=>$match_details]);

    }
  }

   //get all seasons
	public function get_all_seasons(Request $request)
	{
	  $all_seasons = new Seasons;
	  $all_seasons = $all_seasons->with('league')->get();
	  return response()->json(['response_code'=>200,'service_name'=>'get_all_seasons','data'=>$all_seasons]);
  }

  public function edit_match_details(Request $request)
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
         $match_unique_id = $post_data['match_unique_id'];
         if (empty($match_unique_id)) {
         }
         else
         {
           //$match_details = Match::from('game.matches as M');
           $match_details = DB::table('game.matches as M');
           $match_details = $match_details->select('M.match_unique_id','M.season_id','M.scheduled_date_time','M.home','M.away','M.match_id' ,'M.home_point','M.away_point','M.match_result as result','M.scheduled_date_time','PH.first_name as favourite_fighter_first_name','PH.last_name as favourite_fighter_last_name','PH.nick_name as favourite_fighter_nick_name','PH.player_image as favourite_fighter_player_image','PA.first_name as underdog_fighter_first_name', 'PA.last_name as underdog_fighter_last_name','PA.nick_name as underdog_fighter_nick_name','PA.player_image as underdog_fighter_player_image','M.status','CT.combat_type_name as combat_type','CT.combat_type_id','M.championship','M.title_fight','M.main_event','M.weight_class_id','WC.weight_class_name','M.preview_id','NP.news_title as preview_name','M.review_id','NR.news_title as review_name','M.round');
        //    $match_details = $match_details->Join('game.seasons as S','S.season_id', '=', 'M.season_id');
        //    $match_details = $match_details->Join('game.leagues as L','L.league_id', '=', 'S.league_id');
         //   $match_details = $match_details->Join('game.master_sports as MS','MS.sport_id', '=', 'L.sport_id');
         //   $match_details->Join('game.teams as T1', function($q) {
         //             $q->on('T1.team_id', '=', DB::Raw('CAST("M"."home" AS int)'));
         //             $q->on('T1.season_id', '=','M.season_id');
         //   });
         //   $match_details->Join('game.teams as T2', function($q) {
         //             $q->on('T2.team_id', '=', DB::Raw('CAST("M"."away" AS int)'));
         //             $q->on('T2.season_id', '=','M.season_id');
         //   });
           $match_details->Join('game.players as PH', function($q) {
             $q->on('PH.player_id', '=', DB::Raw('CAST("M"."home" AS int)'));
             // $q->on('TH.season_id', '=','M.season_id');
             });
             $match_details->Join('game.players as PA', function($q) {
                     $q->on('PA.player_id', '=', DB::Raw('CAST("M"."away" AS int)'));
                     // $q->on('TA.season_id', '=','M.season_id');
             });
             $match_details = $match_details->leftJoin('game.weight_classes as WC','WC.weight_class_id', '=', 'M.weight_class_id');
             $match_details = $match_details->leftJoin('game.news as NP','NP.news_id', '=', 'M.preview_id');
             $match_details = $match_details->leftJoin('game.news as NR','NR.news_id', '=', 'M.review_id');
             $match_details = $match_details->Join('game.combat_types as CT','CT.combat_type_id', '=', 'M.combat_type_id');
           $match_details = $match_details->where('match_unique_id',$match_unique_id);
           $match_details = $match_details->first();
        $matchStatistics = MatchStatistics::where('match_id', $match_details->match_id)->first();

      return response()->json(['response_code'=>200,'service_name' => 'get_match_details','data'=>$match_details,'matchStatistics'=>$matchStatistics]);

    }
  }

  public function update_match(Request $request)
    {
        $data  = $request->post();
        //print_r($data); die;
        $error = array();
        $rules = [];
        $rules['scheduled_date'] = 'required';
        $rules['combat_type'] = 'required';
        $rules['home_fighter'] ='required';
        // $rules['home_fighter_status'] ='required';
        $rules['away_fighter'] ='required';
        // $rules['away_fighter_status'] ='required';
        $rules['weight_class_id'] ='required';
        $rules['round'] ='required';
        //$rules['championship'] ='required';
        //$rules['title_fight'] ='required';
        //$rules['main_event'] ='required';
        $rules['home_point'] ='required';
        $rules['away_point'] ='required';
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails())
        {
            $error = $validator->errors();
            $error_all = $validator->messages()->all();
            $message = $error_all[array_keys($error_all)[0]];
           return response()->json(['message'=>$message],500);
        }
        else
        {
            $post_data = array(
                'season_id'                  =>$data['combat_type'],
                'scheduled_date_time'        =>$data['scheduled_date'],
                'match_type'                 =>'REG',
                'home'                       => $data['home_fighter'],
                'away'                       => $data['away_fighter'],
                'weight_class_id'            => $data['weight_class_id'],
                'championship'               => $data['championship'],
                //'championship'               => $data['championship'],
                'preview_id'                 => $data['preview_id'],
                'review_id'                  => $data['review_id'],
                'title_fight'                => $data['title_fight'],
                'main_event'                 => $data['main_event'],
                'round'                      => $data['round'],
                'home_point'                 => $data['home_point'],
                'away_point'                 => $data['away_point'],
            );
            if($request->post('championship') !=""){
              $post_values['championship']     = $request->post('championship');
            }
            if($request->post('title_fight') !=""){
              $post_values['title_fight']     = $request->post('title_fight');
            }
            if($request->post('main_event') !=""){
              $post_values['main_event']     = $request->post('main_event');
            }
             //print_r($post_data); die;
            // return $post_data;
            $match = Match::where('match_unique_id',$data['match_unique_id'])->update($post_data);
            if($match)
            {
                return response()->json(['message'=>'fight Update successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }

        }
    }

  public function delete_match(Request $request)
	{
    $match_id = $request->post('match_id');
    $event_opt_match_res = EventOptMatch::where('match_id',$match_id)->first();
    if (!empty($event_opt_match_res)) {
      return response()->json(['message'=>'Permission denied. fight exist in event opt match list'],500);
    }else {
      $res = Match::find($match_id)->delete();
		  return response()->json(['results'=>$res,'message'=>'Fight deleted susscssfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
    }
  }

  //get WeightClass post method
  public function get_weight_classes(Request $request)
  {
    $weight_classes = WeightClasses::all();

	  return response()->json(['response_code'=> 200,'service_name' => 'get_weight_classes','data' => $weight_classes,'message'=> 'get_weight_classes']);
  }

  public function get_news_list(Request $request)
  {
      $all_news =  News::all();
      return response()->json(['response_code'=> 200,'service_name' => 'get_all_news','data' => $all_news]);
  }

  public function add_fight_result(Request $request)
  {
        $data  = $request->post();
        $error = array();
        $rules = [];
        $rules['away_id'] = 'required';
        $rules['home_id'] = 'required';
        $rules['match_id'] ='required';
        $rules['victory_type'] = 'required';
        $rules['winner'] ='required';
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails())
        {
            $error = $validator->errors();
            $error_all = $validator->messages()->all();
            $message = $error_all[array_keys($error_all)[0]];
            return response()->json(['message'=>$message],500);
        }
        else
        {
          $affectedRows = MatchStatistics::where('match_id',$data['match_id'])->delete();
          $affectedRows = PlayerStatistics::where('match_id',$data['match_id'])->delete();
          $affectedRows = DB::table('game.match_player_scores')->where('feed_match_statistics_id',$data['match_id'])->delete();
          if($data['winner'] == 'blue_winner') {
            $home_status = array(
              'player_id' =>$data['home_id'],
              'victory_type' =>$data['victory_type'],
              'victory_round' =>$data['round'],
            );
          }else{
            $home_status = array(
              'player_id' =>$data['home_id'],
              'victory_type' =>0,
              'victory_round' =>0,
            );
          }
          if($data['winner'] == 'red_winner') {
            $away_status = array(
              'player_id' =>$data['away_id'],
              'victory_type' =>$data['victory_type'],
              'victory_round' =>$data['round'],
            );
          }else{
            $away_status = array(
              'player_id' =>$data['away_id'],
              'victory_type' =>0,
              'victory_round' =>0,
            );
          }
          $match_data = Match::find($data['match_id']);
          $winner_id = 0;
          $winner_point = 0;
          $winner_json;
          if($data['winner'] == 'blue_winner'){
            $winner_point = $match_data['home_point'];
            $winner_id = $data['home_id'];
            $winner_json = json_encode($home_status);
          }else{
            $winner_point = $match_data['away_point'];
            $winner_id = $data['away_id'];
            $winner_json = json_encode($away_status);
          }
          $submission = 0; $decision = 0; $ko = 0;
          if($data['victory_type'] == 1){
            $ko =  1;
          }else if ($data['victory_type'] == 2) {
            $submission = 1;
          } else {
            $decision = 1;
          }
          //create match statistics
          $match_statistics = $this->createMatchStatistics($data['match_id'], $home_status, $away_status);

          //create player statistics
          $player_statistics = $this->createPlayerStatistics($data['match_id'],$winner_id, $submission, $decision, $ko,$data['round']);

          //create player statistics scorey
          $match_player_scores = $this->createMatchPlayerScores($winner_id, $score=0, $winner_json, $data['match_id']);

          //update match status
          $match_res = Match::where('match_id',$data['match_id'])->update(array('status' => '1'));

          //update fighter pic
          $winner_array = json_decode($winner_json);
          $victory_type_score_point = Config::get('constants.VICTORY_TYPE_SCORE_POINT');
          $round_score_point = Config::get('constants.ROUND_SCORE_POINT');
          $fighter_picks_data = FighterPicks::where('match_id', $data['match_id'])->get();
          foreach ($fighter_picks_data as $key => $value) {
            if ($winner_array->player_id == $value['pick_winner_id']) {
              $score = $winner_point;
              if($value['pick_victory_type'] == $data['victory_type']) {
                $score = $score + $victory_type_score_point;
              }
              if($value['pick_victory_type'] == 3 || $value['pick_round'] == $data['round']){
                $score = $score + $round_score_point;
              }
              // if($value['pick_round'] == $data['round']){
              //   $score = $score + $round_score_point;
              // }
              $fighter_pic_data = array(
                'score'             =>$score,
                'result'            =>$winner_json
              );
            }else{
              $fighter_pic_data = array(
                'score'             =>0,
                'result'            =>$winner_json
              );
            }

            $FighterPicks = FighterPicks::where('fighter_pick_id',$value['fighter_pick_id'])->where('match_id',$data['match_id'])->update($fighter_pic_data);
          }
          
          if($match_statistics)
          {
            $victory_type =VictoryTypes::find($data['victory_type']); 
            $player_data = Player::whereIn('player_id',array($data['home_id'],$data['away_id']))->get()->toArray();
            $notification_title = 'Fight Result';
            if($winner_id == $player_data[0]['player_id']) {
              $notification_content = 'Fight result is declared '.$player_data[0]['first_name']." ".$player_data[0]['last_name'].' '. 'defeats' .' '.$player_data[1]['first_name']." ".$player_data[1]['last_name']. ' '. 'by '.$victory_type->victory_type_name.' in '.$data['round'].' round';
            }else{
              $notification_content = 'Fight result is declared '.$player_data[1]['first_name']." ".$player_data[1]['last_name'].' '. 'defeats' .' '.$player_data[0]['first_name']." ".$player_data[0]['last_name']. ' '. 'by '.$victory_type->victory_type_name.' in '.$data['round'].' round';
            }
            $user_to_send_notification = FighterPicks::where('match_id',$data['match_id'])->get()->toArray();
            $receiver_user_ids = array_column($user_to_send_notification, 'user_id');
            
            $current_date = format_date();
            foreach ($receiver_user_ids as $receiver_user_id) {
              $insert_notification= new Notification_model();
              $insert_notification->notification_type_id = 1;
              $insert_notification->sender_user_id = 0;
              $insert_notification->receiver_user_id = $receiver_user_id;
              $insert_notification->notification = $notification_content;
              $insert_notification->title = $notification_title;
              $insert_notification->created_date = $current_date;
              $insert_notification->updated_date = $current_date;
              $insert_notification->save();
            }
            $user_to_send_notifications = User::select('device_token')->whereIn('user_id',$receiver_user_ids)->get()->toArray();
            //$device_token = array_column($user_to_send_notifications, 'device_token');
            $device_token = array_diff(array_column($user_to_send_notifications, 'device_token'),['']);
            if(!empty($device_token)){
              $response = Notification::send_notification($notification_title, $notification_content, $device_token);
            }
              return response()->json(['message'=>'Fight Result Add Successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
          }

        }
  }

    private function createMatchStatistics($match_id, $home_status, $away_status)
    {
      $post_match_statistics_data = array(
          'match_id'      =>$match_id,
          'home_stats'      =>json_encode($home_status),
          'away_stats'      =>json_encode($away_status),
      );
      $matchStatistics = MatchStatistics::create($post_match_statistics_data);
      return $matchStatistics;
    }

    private function createPlayerStatistics($match_id,$winner_id, $submission, $decision, $ko, $round)
    {
      $post_player_statistics_data = array(
          'player_id'     =>$winner_id,
          'submission'    =>$submission,
          'decision'      =>$decision,
          'ko'            =>$ko,
          'round'         =>$round,
          'win'           =>1,
          'match_id'      =>$match_id,
      );
      $playerStatistics = PlayerStatistics::create($post_player_statistics_data);
      return $playerStatistics;
    }
    private function createMatchPlayerScores($winner_id, $totalscore, $winner_json, $match_id)
    {
      DB::table('game.match_player_scores')->insert([
        'player_unique_id'      =>$winner_id,
        'score'                 =>$totalscore,
        'break_down'            =>$winner_json,
        'feed_match_statistics_id'  =>$match_id,
        'team_id'               =>0,
        ]);
      //return $playerStatistics;
    }

}
