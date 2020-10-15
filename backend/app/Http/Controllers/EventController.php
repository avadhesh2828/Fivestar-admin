<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Events;
use App\Models\Ad_position;
use App\Models\Match;
use App\Models\EventOptMatch;
use App\Models\Contest;
use File;
use DB;
use Validator;

class EventController extends Controller
{
    public function list(Request $request)
    {
        \DB::enableQueryLog();
        $all_events = new events;
        // Partial Keyword Search Filter with player name
        if($request->keyword != "" )
        {
            $all_events = $all_events->where('event_name','ilike', '%'.$request->keyword.'%');
        }
        $all_events = $all_events->orderBy('event_id','DESC');
        $all_events = $all_events->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'event_list','data' => $all_events]);
    }

    public function get_tournaments(Request $request){
        // $tournaments = Match::whereBetween('scheduled_date_time', [$request->start_date, $request->end_date])
        // ->get();

        // $tournaments = Match::from('game.matches as M');
        $tournaments = DB::table('game.matches as M');
        $tournaments = $tournaments->select('M.match_unique_id','M.match_id','M.match_result as result','M.scheduled_date_time', 'M.home as home_id', 'M.away as away_id','PH.first_name as home_fighter_first_name','PH.last_name as home_fighter_last_name','PH.nick_name as home_fighter_nick_name','PH.player_image as home_fighter_player_image','PA.first_name as away_fighter_first_name', 'PA.last_name as away_fighter_last_name','PA.nick_name as away_fighter_nick_name','PA.player_image as away_fighter_player_image','M.status');
        $tournaments->Join('game.players as PH', function($q) {
          $q->on('PH.player_id', '=', DB::Raw('CAST("M"."home" AS int)'));
        });

        $tournaments->Join('game.players as PA', function($q) {
                  $q->on('PA.player_id', '=', DB::Raw('CAST("M"."away" AS int)'));
        });

        //$tournaments->join('game.promotions as PHP', 'PHP.id', '=', 'PH.promotion_id');//'PHP.name as promotion_name_home'
        //$tournaments->join('game.promotions as PAP', 'PAP.id', '=', 'PA.promotion_id'); //'PAP.name as promotion_name_away'
        // $tournaments->whereBetween('scheduled_date_time', [$request->start_date, $request->end_date]);
        $tournaments->whereDate('scheduled_date_time', '=', $request->event_date);
        $tournaments = $tournaments->whereNull('M.deleted_at');
        $tournaments = $tournaments->orderBy('M.scheduled_date_time','ASC');
        $tournaments = $tournaments->get();
        //print_r($tournaments); die;

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

      public function create_event( Request $request ){

        $eventDetails = $request->post('event_details');

        // FUTURE TODOs: Many validations pending need to be completed in future
        $validator = Validator::make($eventDetails, [
          "event_name" => ['required'],
          "venue_name" => ['required'],
          "venue_zipcode" => ['required'],
          "event_datetime" => ['required'],
          "opt_matches" => ['required'],
          "opt_matches_dates" => ['required'],
          "promotion_id" => ['required']
        ]);

        if($validator->fails()){
          return response()->json([
            'response_code'=> 400,
            'service_name' => 'create_contest',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
          ], 400);
        }

        $newEvent = Events::create([
          "event_name" => $eventDetails['event_name'],
          "venue_name" => $eventDetails['venue_name'],
          "venue_zipcode" => $eventDetails['venue_zipcode'],
          "event_datetime" => $eventDetails['event_datetime'],
          "promotion_id" => $eventDetails['promotion_id'],
          "venue_city" => $eventDetails['venue_city'],
          "venue_address" => $eventDetails['venue_address'],
        ]);
        // Creating opt matches //$newEvent->event_id
        $this->create_opt_matches($newEvent->event_id, explode(',', $eventDetails['opt_matches']));

        return response()->json([
          'response_code'=> 200,
          'service_name' => 'create',
          'message'=> 'Event Created Successfully',
        ]);
      }

    private function create_opt_matches( $eventId, $matchIds ){
      $match_data = Match::WhereIn('match_id',$matchIds)->orderBy('scheduled_date_time','ASC')->get();
      $date = date('Y-m-d H:i:s');
        foreach( $match_data as $matchId ){
            EventOptMatch::create([
            "event_id" => $eventId,
            "match_id" => $matchId->match_id,
            "created_at" => $date,
            "updated_at" => $date,
            ]);
        }
    }

    public function update_event( Request $request ){

      $eventDetails = $request->post('event_details');
      // FUTURE TODOs: Many validations pending need to be completed in future
      $validator = Validator::make($eventDetails, [
        "event_name" => ['required'],
        "venue_name" => ['required'],
        "venue_zipcode" => ['required'],
        "event_datetime" => ['required'],
        //"opt_matches" => ['required'],
        //"opt_matches_dates" => ['required'],
        "promotion_id" => ['required']
      ]);

      if($validator->fails()){
        return response()->json([
          'response_code'=> 400,
          'service_name' => 'create_contest',
          'message'=> 'Validation Failed',
          'global_error'=> $validator->errors()->first(),
        ], 400);
      }

      $newEvent = Events::where('event_id',$eventDetails['event_id'])->update([
        "event_name" => $eventDetails['event_name'],
        "venue_name" => $eventDetails['venue_name'],
        "venue_zipcode" => $eventDetails['venue_zipcode'],
        "event_datetime" => $eventDetails['event_datetime'],
        "promotion_id" => $eventDetails['promotion_id'],
        "venue_city" => $eventDetails['venue_city'],
        "venue_address" => $eventDetails['venue_address'],
      ]);
      // Creating opt matches
      if(isset($eventDetails['opt_matches']) && !empty($eventDetails['opt_matches'])){
        $deleteEventOptMatch = EventOptMatch::where('event_id',$eventDetails['event_id'])->delete();
         $this->create_opt_matches($eventDetails['event_id'], explode(',', $eventDetails['opt_matches']));
      }
      return response()->json([
        'response_code'=> 200,
        'service_name' => 'create',
        'message'=> 'Event Updated Successfully',
      ]);
    }

    //this function get only single news detail
    public function get_event_by_id(Request $request)
    {

        $event_id = $request->event_id;

        $event_data = new Events;


		  $event_data = $event_data->select('event_id','event_name','venue_name','venue_address','venue_city', 'venue_zipcode', 'event_datetime','promotion_id','name as promotion_name');

        $event_data = $event_data->Join('game.promotions','id', '=', 'promotion_id');
        $event_data = $event_data->Where('event_id',$event_id)->first();

        $fight_ids = Events::find($event_id)->event_opt_match;
        $match_ids=[];
        if(!empty($fight_ids)){
            foreach ($fight_ids as $key => $value) {
                $match_ids[] = $value->match_id;
            }
        }
        //$match_data = Match::where_in('match_id',$match_ids)->get();
        $tournaments = $this->get_matches_by_match_ids($match_ids);



    	return response()->json(['response_code'=>200,'data'=>$event_data,'tournaments'=>$tournaments]);
    }

    private function get_matches_by_match_ids($match_ids){
        // $tournaments = Match::from('game.matches as M');
        $tournaments =  DB::table('game.matches as M');
        $tournaments = $tournaments->select('M.match_unique_id','M.match_id','M.match_result as result','M.scheduled_date_time', 'M.home as home_id', 'M.away as away_id','PH.first_name as home_fighter_first_name','PH.last_name as home_fighter_last_name','PH.nick_name as home_fighter_nick_name','PH.player_image as home_fighter_player_image','PA.first_name as away_fighter_first_name', 'PA.last_name as away_fighter_last_name','PA.nick_name as away_fighter_nick_name','PA.player_image as away_fighter_player_image','M.status');
        $tournaments->Join('game.players as PH', function($q) {
          $q->on('PH.player_id', '=', DB::Raw('CAST("M"."home" AS int)'));
          });
          $tournaments->Join('game.players as PA', function($q) {
                  $q->on('PA.player_id', '=', DB::Raw('CAST("M"."away" AS int)'));
          });
        // $tournaments->whereBetween('scheduled_date_time', [$request->start_date, $request->end_date]);
        $tournaments->whereIn('match_id', $match_ids);
        $tournaments = $tournaments->whereNull('M.deleted_at');
        $tournaments = $tournaments->get();
        return $tournaments;
    }

  public function delete_event(Request $request)
	{
    $event_id = $request->post('event_id');
    $contest_res = Contest::where('event_id',$event_id)->first();
    if (!empty($contest_res)) {
      return response()->json(['message'=>'Permission denied. event exist in contest list'],500);
    }else {
      $res = EventOptMatch::where('event_id',$event_id)->delete();
      $res = Events::find($event_id)->delete();
		  return response()->json(['results'=>$res,'message'=>'Event deleted Successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
    } 
  }

}
