<?php

namespace App\Http\Controllers\Contest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

# Models
use App\Models\Contest;
use App\Models\Leagues;
use App\Models\Match;
use App\Models\MatchWeek;
use App\Models\MasterPrize;
use App\Models\ContestUserPrime;
use App\Models\GameStyle;
use App\Models\Seasons;
use App\Models\ContestOptMatch;
use App\Models\FighterPicks;
use App\Console\Commands\WinningTieCommand;
use App\Helpers\Winner;

# Libraries and Helpers
use Validator;
use App\Rules\Contest\EndDate;
use App\Rules\Contest\DraftDate;
use DB;

class ContestController extends Controller
{

  public function index( Request $request )
  {
    $contest = new Contest;
    DB::enableQueryLog();
    $contest = $contest->whereBetween('entry_fees', [$request->min_entry_fee, $request->max_entry_fee]);

    if(!empty($request->status)){
      $contest = $contest->where('status', $request->status);
    }

    if( !empty($request->keyword) ){
      $contest = $contest->where('contest_name', 'ilike', '%'.$request->keyword.'%')
      ->orWhere('contest_uid', 'ilike', '%'.$request->keyword.'%');
    }
    $contest = $contest->whereNull('deleted_at');
    $contest = $contest->orderBy('start_date','DESC');
    $contest = $contest->paginate($request->perPage);
    
    //dd(DB::getQueryLog());
    if($contest->count() == 0){
      return response()->json([
        'response_code'=> 404,
        'service_name' => 'contest_list',
        'global_error'=> 'No contest found',
      ], 404);
    }

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'contest_list',
      'data' => $contest,
      'message'=> 'Contests found',
    ]);
  }

  public function pre_data(){

    $preData['leagues'] = Leagues::where('status', 1)
    ->with(['season'])
    ->get();
    $preData['prizes'] = MasterPrize::where('status', 1)
    ->get();

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'pre_data',
      'data' => $preData,
      'message'=> 'Pre Data Fetched',
    ]);

  }

  public function get_match_weeks($season_id, $game_style_id){
    DB::enableQueryLog();
    $season = Seasons::where('season_id', $season_id)->first();
    $gameStyle = GameStyle::where('master_game_styles_id', $game_style_id)->first();

    if($season && $gameStyle){
      $matchWeeks = $this->construct_weeks($season, $gameStyle);

      if( count($matchWeeks) > 0 ){

        return response()->json([
          'response_code'=> 200,
          'service_name' => 'get_match_weeks',
          'data' => $matchWeeks,
          'message'=> 'Pre Data Fetched',
        ]);

      }
    }
    return response()->json([
      'response_code'=> 404,
      'service_name' => 'get_match_weeks',
      'global_error'=> 'No match weeks found',
    ], 404);
  }

  private function construct_weeks($season, $gameStyle){
    $weeks = [];

    if( strtolower($season->league->league_url_name) === 'nfl' && $gameStyle->abbr === '1-week' ){

      $weeks = MatchWeek::where('season_id', $season->season_id)
      ->where('start_date_time', '>', format_date())
      ->get();

    }else if( strtolower($season->league->league_url_name) === 'nfl' && $gameStyle->abbr === 'bestball' ){

      // Create instance for all weeks
      $allWeeks = MatchWeek::where('season_id', $season->season_id);

      $option1 = $this->subquery_for_ranged_weeks($allWeeks)->first();

      // Create instance for all weeks skipping 4 records
      $allWeeks = MatchWeek::where('season_id', $season->season_id)->skip(4);

      $option2 = $this->subquery_for_ranged_weeks($allWeeks)->first();

      // Create instance for all weeks skipping 8 records
      $allWeeks = MatchWeek::where('season_id', $season->season_id)->skip(8);

      $option3 = $this->subquery_for_ranged_weeks($allWeeks)->first();

      $weeks = [
        $option1,
        $option2,
        $option3,
      ];

    }else if( strtolower($season->league->league_url_name) === 'pga' && $gameStyle->abbr === 'bestball' ){
      $weeks = Match::where('season_id', $season->season_id)
      ->where('scheduled_date_time', '>', format_date())
      ->get();
    }

    return $weeks;
  }

  private function subquery_for_ranged_weeks($allWeeks){

    // Get Min Max week and Min start and Max end date according to $allWeeks subquery
    return \DB::table(\DB::raw("({$allWeeks->toSql()}) as sub"))
    ->select(\DB::raw('CONCAT(\'NFL Weeks \', MIN("match_week"), \'-\', MAX("match_week")) as match_week, MIN("start_date_time") as start_date_time, MAX("end_date_time") as end_date_time'))
    ->mergeBindings($allWeeks->getQuery());
  }

  public function show($contest_unique_id, Request $request)
  {
    // if($contest = Contest::where('contest_uid', $contest_unique_id)
    // ->with(['prize'])
    // ->first()){
      //$Contest = Contest::from('game.contests as C');
      $Contest = DB::table('game.contests as C');

      $Contest = $Contest->select('C.*','E.event_name','MGS.name as master_game_style');
  
      $Contest = $Contest->leftJoin('game.events as E','E.event_id', '=', 'C.event_id');
      $Contest = $Contest->leftJoin('game.master_game_styles as MGS','MGS.master_game_styles_id', '=', 'C.master_game_style_id');
      $contest = $Contest->Where('C.contest_uid',$contest_unique_id)->first();

      $prizes = MasterPrize::where('master_prize_id',$contest->master_prize_id)->first();
      
      if(!empty($contest)){
        $participants = ContestUserPrime::where('contest_id', $contest->contest_id)
        ->with(['user'])
        ->paginate($request->perPage);
        if($contest->status == 4) {
          $winners = Winner::contest_winner($contest);
        }else {
          $winners = [];
        }

        return response()->json([
          'response_code'=> 200,
          'service_name' => 'show_contest',
          'data' => [
            'contest' => $contest,
            'participants' => $participants,
            'winners' => $winners,
            'prizes' => $prizes
          ],
          'message'=> 'Contest found',
        ]);
      }

    return response()->json([
      'response_code'=> 404,
      'service_name' => 'show_contest',
      'global_error'=> 'No contest found',
    ], 404);
  }
  

  public function contest_leaderboard($contest_id, Request $request)
  {
    //print_r($contest_id); die;
    
      $Contest = DB::table('game.fighter_picks as FP');
      $Contest = $Contest->select('FP.contest_id','FP.user_id','FP.score','U.user_name','U.first_name','U.last_name','U.image');
      $Contest = $Contest->Join('users.user as U','U.user_id', '=', 'FP.user_id');
      $contest = $Contest->distinct('FP.user_id');
      if(isset($request->keyword) && $request->keyword != '')
      {
        $contest = $contest->where('U.first_name', 'ilike', '%'.$request->keyword.'%')->orWhere('U.last_name', 'ilike', '%'.$request->keyword.'%');
      }
      $contest = $Contest->Where('FP.contest_id',$contest_id)->get();
      
      $fights_score = DB::table('game.fighter_picks')
      ->select('game.fighter_picks.user_id',DB::raw('SUM(game.fighter_picks.score) As total_score'))
      ->join('users.user', 'game.fighter_picks.user_id', '=', 'users.user.user_id')
      ->where('game.fighter_picks.contest_id',$contest_id)
      ->groupBy('game.fighter_picks.user_id')
      ->get();
      //->paginate($request->perPage);
      $data_array = [];
      foreach ($contest as $key => $contest_value) {
        foreach ($fights_score as $key1 => $fights_score_value) {
          if($contest_value->user_id == $fights_score_value->user_id){
            if (substr($contest_value->image,0,4) != "http")
            {
              $contest_value->image = \Config::get('constants.ROOT_IMAGE_PATH').'uploads/profile_image/'.$contest_value->image;
            }
            $data_array[] = array(
              'user_id' => $contest_value->user_id,
              'user_name' => $contest_value->user_name,
              'first_name' => $contest_value->first_name,
              'last_name' => $contest_value->last_name,
              'image' => $contest_value->image,
              'total_score' => $fights_score_value->total_score,
            );
            unset($fights_score[$key1]);
          }
        }
      }

      $score = array();
      foreach ($data_array as $key => $row)
      {
          $score[$key] = $row['total_score'];
      }
      array_multisort($score, SORT_DESC, $data_array);

    if(empty($data_array)) {
      return response()->json([
        'service_name' => 'contest_leaderboard',
        'message'=> 'No contest found',
        'data' => [],
      ], 200);
    }

    return response()->json([
      'service_name' => 'contest_leaderboard',
      'data' => [
        'contest' => $contest,
        'participants' => $data_array,
      ],
      'message'=> 'Contests found',
    ], 200);
  }

  public function get_prizes(Request $request){
    $prizes = new MasterPrize;
    if( $request->type === 'h2h' ){
      $prizes = $prizes->whereRaw("LOWER(prize_name) = 'top-1'");
    }else{
      $prizes = $prizes->whereRaw("LOWER(prize_name) IN ('top-3', 'top 30%')");
    }
    $prizes = $prizes->get();

    if($prizes->count() == 0){
      return response()->json([
        'response_code'=> 404,
        'service_name' => 'get_prizes',
        'global_error'=> 'No prizes found',
      ], 404);
    }

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'get_prizes',
      'data' => $prizes,
      'message'=> 'Prizes found',
    ]);
  }

  public function contest_fighter_pic(Request $request)
  {
    $data = $request->post();
    $fights_pic = DB::table('game.fighter_picks')
    ->select('game.fighter_picks.contest_id','game.fighter_picks.pick_round','game.victory_types.victory_type_name','users.user.first_name','users.user.last_name','WUP.first_name as player_winner_first_name','WUP.last_name as player_winner_last_name','PH.first_name as home_player_first_name','PH.last_name as home_player_last_name','PA.first_name as away_player_first_name','PA.last_name as away_player_last_name')
    ->join('users.user', 'game.fighter_picks.user_id', '=', 'users.user.user_id')
    ->join('game.victory_types', 'game.victory_types.victory_type_id', '=', 'game.fighter_picks.pick_victory_type')
    ->join('game.players as WUP', 'WUP.player_id', '=', 'game.fighter_picks.pick_winner_id')
    ->join('game.matches as M', 'M.match_id', '=', 'game.fighter_picks.match_id')
    ->join('game.players as PH', 'PH.player_id', '=', 'M.home')
    ->join('game.players as PA', 'PA.player_id', '=', 'M.away')
    ->where('game.fighter_picks.contest_id',$data['contest_id'])
    ->get();
    return response()->json([
      'response_code'=> 200,
      'service_name' => 'contest_fighter_pic',
      'data' => $fights_pic,
      'message'=> 'contest_fighter_pic',
    ]);
  }

  public function get_tournaments(Request $request){
    // $tournaments = Match::whereBetween('scheduled_date_time', [$request->start_date, $request->end_date])
    // ->get();

    $tournaments = Match::from('game.matches as M');
    $tournaments = $tournaments->select('M.match_unique_id','M.match_id','M.match_result as result','M.scheduled_date_time', 'M.home as home_id', 'M.away as away_id','PH.first_name as home_fighter_first_name','PH.last_name as home_fighter_last_name','PH.nick_name as home_fighter_nick_name','PH.player_image as home_fighter_player_image','PA.first_name as away_fighter_first_name', 'PA.last_name as away_fighter_last_name','PA.nick_name as away_fighter_nick_name','PA.player_image as away_fighter_player_image','M.status');
    $tournaments->Join('game.players as PH', function($q) {
      $q->on('PH.player_id', '=', DB::Raw('CAST("M"."home" AS int)'));
      });
      $tournaments->Join('game.players as PA', function($q) {
              $q->on('PA.player_id', '=', DB::Raw('CAST("M"."away" AS int)'));
      });
    $tournaments->whereBetween('scheduled_date_time', [$request->start_date, $request->end_date]);
    $tournaments = $tournaments->get();

    if($tournaments->count() == 0){
      return response()->json([
        'response_code'=> 404,
        'service_name' => 'get_tournaments',
        'global_error'=> 'No tournaments found',
      ], 404);
    }

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'get_tournaments',
      'data' => $tournaments,
      'message'=> 'Tournaments found',
    ]);
  }

  public function create_contest( Request $request ){

    $contestDetails = $request->post('contest_details');
    //print_r($contestDetails); die;
    // FUTURE TODOs: Many validations pending need to be completed in future
    $validator = Validator::make($contestDetails, [
      "contest_name" => ['required', 'min:6', 'max:30'],
      "entry_fees" => ['required', "numeric", "min:0", "max:10000"],
      "start_date" => ['required'],
      "end_date" => ['required', new EndDate($contestDetails['start_date'])],
     // "opt_matches" => ['required'],
      //"opt_matches_dates" => ['required'],
      "game_size" => ['required', "numeric", "min:5", "max:11520"],
      "site_rake" => ['required'],
      "prize_pool" => ['required'],
      "prize_payout" => ['required']
    ]);

    if($validator->fails()){
      return response()->json([
        'response_code'=> 400,
        'service_name' => 'create_contest',
        'message'=> 'Validation Failed',
        'global_error'=> $validator->errors()->first(),
      ], 400);
    }

    $newContest = Contest::create([
      "contest_uid" => random_string(),
      "user_id" => 0,
      "contest_name" => $contestDetails['contest_name'],
      "event_id" => (int)$contestDetails['event_id'],
      "master_game_style_id" => $contestDetails['master_game_style_id'],
      "entry_fees" => $contestDetails['entry_fees'],
      "start_date" => $contestDetails['start_date'],
      "end_date" => $contestDetails['end_date'],
      "size" => $contestDetails['game_size'],
      "site_rake" => $contestDetails['site_rake'],
      "prize_pool" => $this->calculate_prize_pool($contestDetails),
      "master_prize_id" => $contestDetails['prize_payout'],
      "status" => 1,
      "is_private" => 0,
    ]);

    // Creating opt matches
    //$this->create_opt_matches($newContest->contest_id, explode(',', $contestDetails['opt_matches']));

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'create',
      'message'=> 'Contest Created Successfully',
    ]);
  }

  private function create_opt_matches( $contestId, $matchIds ){
    foreach( $matchIds as $matchId ){
      ContestOptMatch::create([
        "contest_id" => $contestId,
        "match_id" => $matchId,
      ]);
    }
  }

  private function calculate_prize_pool($contestDetails){
    $siteRake = ($contestDetails['game_size'] * $contestDetails['entry_fees']) * $contestDetails['site_rake'] / 100;
    $prize_pool = ($contestDetails['game_size'] * $contestDetails['entry_fees']) - $siteRake;
    return $prize_pool;
  }

  public function update_contest( Request $request ){

    $contestDetails = $request->post('contest_details');
    //print_r($contestDetails); die;
    // FUTURE TODOs: Many validations pending need to be completed in future
    $validator = Validator::make($contestDetails, [
      "contest_name" => ['required', 'min:6', 'max:30'],
      "entry_fees" => ['required', "numeric", "min:0", "max:10000"],
      "start_date" => ['required'],
      "end_date" => ['required', new EndDate($contestDetails['start_date'])],
      "game_size" => ['required', "numeric", "min:5", "max:11520"],
      "site_rake" => ['required'],
      "prize_pool" => ['required'],
      "prize_payout" => ['required']
    ]);

    if($validator->fails()){
      return response()->json([
        'response_code'=> 400,
        'service_name' => 'create_contest',
        'message'=> 'Validation Failed',
        'global_error'=> $validator->errors()->first(),
      ], 400);
    }
    $condition = array('contest_uid' => $contestDetails['contest_uid']);
    $newContest = Contest::where($condition)->update([
      "user_id" => 0,
      "contest_name" => $contestDetails['contest_name'],
      "event_id" => (int)$contestDetails['event_id'],
      "master_game_style_id" => $contestDetails['master_game_style_id'],
      "entry_fees" => $contestDetails['entry_fees'],
      "start_date" => $contestDetails['start_date'],
      "end_date" => $contestDetails['end_date'],
      "size" => $contestDetails['game_size'],
      "site_rake" => $contestDetails['site_rake'],
      "prize_pool" => $this->calculate_prize_pool($contestDetails),
      "master_prize_id" => $contestDetails['prize_payout'],
      "status" => 1,
      "is_private" => 0,
    ]);

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'create',
      'message'=> 'Contest Update Successfully',
    ]);
  }

  public function delete_contest(Request $request)
	{
    $contest_uid = $request->post('contest_uid');
    $res = Contest::where('contest_uid',$contest_uid)->delete();
    //print_r($res); die;
    return response()->json(['results'=>$res,'message'=>'Contest deleted susscssfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
    
  }

  public function update_prediction(Request $request)
	{
    if($request->prediction == 0) {
      $status = 1;
    }else{
      $status = 0;
    }
    $res = Contest::where('contest_id',$request->contest_id)->update(['prediction_status' =>$status]);

    return response()->json(['results'=>$res,'message'=>'Contest prediction status update susscssfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
    
  }

}
