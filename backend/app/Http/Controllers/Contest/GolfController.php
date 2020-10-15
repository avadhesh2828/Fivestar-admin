<?php

namespace App\Http\Controllers\Contest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

# Models
use App\Models\Match;
use App\Models\MasterPrize;
use App\Models\Contest;
use App\Models\ContestOptMatch;

# Libraries and Helpers
use Validator;
use App\Rules\Contest\EndDate;
use App\Rules\Contest\DraftDate;


class GolfController extends Controller
{
  public function get_tournaments(Request $request){
    $tournaments = Match::whereBetween('scheduled_date_time', [$request->start_date, $request->end_date])
    ->where('season_id', $request->season_id)
    ->get();

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

  public function create_championship( Request $request ){

    $contestDetails = $request->post('contest_details');

    // FUTURE TODOs: Many validations pending need to be completed in future
    $validator = Validator::make($contestDetails, [
      "contest_name" => ['required', 'min:6', 'max:30'],
      "season_id" => ['required'],
      "master_game_styles_id" => ['required'],
      "entry_fees" => ['required', "numeric", "min:10", "max:10000"],
      "start_date" => ['required'],
      "end_date" => ['required', new EndDate($contestDetails['start_date'])],
      "opt_matches" => ['required'],
      "opt_matches_dates" => ['required'],
      "play_off_date" => ['required'],
      "game_size" => ['required', "numeric", "min:8000", "max:11520"],
      "site_rake" => ['required'],
      "prize_pool" => ['required'],
      "prize_payout" => ['required'],
      "lineup_style" => ['required'],
      "draft_type" => ['required'],
      "projected_drafting_end_date" => ['required'],
      "draft_speed" => ['required'],
      "when_to_draft" => ['required'],
    ]);

    if($validator->fails()){
      return response()->json([
        'response_code'=> 400,
        'service_name' => 'create_contest',
        'message'=> 'Validation Failed',
        'global_error'=> $validator->errors()->first(),
      ], 400);
    }

    $draftSpeed = explode('-', $contestDetails['draft_speed'])[1];

    $newContest = Contest::create([
      "contest_uid" => random_string(),
      "user_id" => 0,
      "contest_name" => $contestDetails['contest_name'],
      "season_id" => $contestDetails['season_id'],
      "master_game_style_id" => $contestDetails['master_game_styles_id'],
      "entry_fees" => $contestDetails['entry_fees'],
      "start_date" => $contestDetails['start_date'],
      "end_date" => $contestDetails['end_date'],
      "playoff_date" => $contestDetails['play_off_date'],
      "size" => $contestDetails['game_size'],
      "site_rake" => $contestDetails['site_rake'],
      "prize_pool" => $this->calculate_prize_pool($contestDetails),
      "master_prize_id" => $contestDetails['prize_payout'],
      "lineup_style" => ($contestDetails['lineup_style'] === 'standard') ? 1 : 2, // 1=Standard, 2=Superflex
      "draft_type" => $contestDetails['draft_type'], // Snake Draft by default
      "projected_drafting_end_date" => $contestDetails['projected_drafting_end_date'],
      "draft_speed" => explode('-', $contestDetails['draft_speed'])[1], // Fast = 30 secs, Regular = 60 secs, Slow = 8 Hours
      "when_to_draft" => $contestDetails['when_to_draft'], // 1 = When Filled, 2 = Scheduled
      "status" => 1,
      "is_private" => 0,
    ]);

    // Creating opt matches
    $this->create_opt_matches($newContest->contest_id, explode(',', $contestDetails['opt_matches']));

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
}
