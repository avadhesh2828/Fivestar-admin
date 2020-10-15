<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Player;
use App\Models\Players_Trades;
use App\Models\Seasons;
use App\Models\Player_Share_History;
use App\Models\Leagues;
use App\Models\Team;
use App\Models\FighterStatuses;
use App\Models\Match;
use DB;
use Validator;

class PlayerController extends Controller
{
	//get_all_players post method
  public function get_all_players(Request $request)
  {
		\DB::enableQueryLog();
		$all_players = new Player;
		// Eager load relationship
		$all_players = $all_players->with(['promotion']);
	// 	//league_id filter
	// 	$all_players = $all_players->whereHas('seasons_detail', function($q) use ($request){
	// 	if(isset($request->league_id) && $request->league_id > -1)
	// 	  {
	// 	   	$all_players = $q->where('league_id', $request->league_id);
	// 	  }
  	// });
  	// //team_id filter
	// 	$all_players = $all_players->whereHas('team_detail', function($q) use ($request){
	// 		if(isset($request->team_id) && $request->team_id > -1)
	// 	  {
	// 	   	$all_players = $q->where('team_id', $request->team_id);
	// 	  }
  	// });
    //position filter
    //print_r($request->all()); die;
  	if (isset($request->position) && $request->position != "All" && $request->position != '') {
	    $all_players=	$all_players->where('position_abbr', $request->position);
	  }
	  //status filter
	  if (isset($request->status) && $request->status > -1) {
	    $all_players=	$all_players->where('status', $request->status);
    }
    if (isset($request->promotion)) {
      $all_players=	$all_players->where('promotion_id', $request->promotion);
    }
	 // Partial Keyword Search Filter with player name
			if($request->keyword != "" )
			{

    	$all_players=	$all_players->where(DB::raw("concat(first_name,' ',last_name)"), 'ilike', '%'.$request->keyword.'%');
  	}
  	$all_players = $all_players->orderBy('last_name','ASC');
	  $all_players = $all_players->paginate($request->per_page);
	  return response()->json(['response_code'=> 200,'service_name' => 'get_all_players','data' => $all_players,'message'=> 'get_all_players']);
  }

  //get all positions post
	public function player_list(Request $request)
	{
  	$result =Player::select('player_id','first_name','last_name','full_name','player_unique_id')->orderBy('last_name','ASC')->get();
	  return response()->json(['response_code'=>200,'service_name'=>'player_list','data'=>$result]);
	}

	//get_all_teams post method
  public function get_all_teams(Request $request)
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
		return response()->json(['response_code'=>200,'service_name'=>'get_all_teams','data'=>$all_teams]);
	}

	//get all positions post
	public function get_all_positions(Request $request)
	{
		$league_id = $request->post('league_id');
		$result = array();
  	$result =Player::select('position_abbr','position_abbr as position')
    ->groupBy('position_abbr')
    ->orderBy('position_abbr', 'ASC')
    ->whereNotNull('position_abbr')
    ->get();
	  return response()->json(['response_code'=>200,'service_name'=>'get_all_positions','data'=>$result]);
	}

	//get all league
	public function get_all_leagues()
  {
  	$query = Leagues::with('mastersports')->where('status',1)->orderBy('league_sequence','ASC')->orderBy('league_name', 'ASC')->get();
  	$total = $query->count();
		$results['results'] = $query;
		$results['total'] = $total;
    return response()->json(['response_code'=>200,'service_name' => 'get_all_leagues','data'=>$results]);
  }

  //get all seasons
	public function get_all_seasons(Request $request)
	{
	  $all_seasons = new Seasons;
	  $all_seasons = $all_seasons->with('league');
		$all_seasons = $all_seasons->whereHas('league', function($q) use ($request){
    if(isset($request->league_id) && $request->league_id != ''){
        $q->where('league_id', $request->league_id);
      }
    });
		if (isset($request->seasons_year) && $request->seasons_year  > -1) {
	    	$all_seasons = $all_seasons->where('season_year', $request->seasons_year);
		}
		$all_seasons = $all_seasons->paginate($request->per_page);
	  return response()->json(['response_code'=>200,'service_name'=>'get_all_seasons','data'=>$all_seasons]);
	}

  //get all seaons year
  public function get_all_seasons_year(Request $request)
	{
		$league_id = $request->post('league_id');
		$result = array();
	  $result =Seasons::select('season_year')->where('league_id',$league_id)->orderBy('season_year', 'ASC')->get();
	 	return response()->json(['response_code'=>200,'service_name'=>'get_all_seasons_year','data'=>$result]);
	}

	//update player status
	public function update_player_status(Request $request)
	{
		$player_unique_id = $request->post('player_unique_id');
  	$status = $request->post('status');
		$results= Player::where('player_unique_id', $player_unique_id)->update(array('status' => $status));
		if($results)
		{
			return response()->json(['response_code'=>200,'data'=>$results,'message' => 'Fighter status updated successfully.']);
		}
		else
		{
			return response()->json(['response_code'=>500,'message' => 'Some Problem updating Fighter status.']);
		}
	}

	//get all player detail post
	public function get_player_details(Request $request)
	{
		  $player_unique_id = $request->player_id;
			$player_detail = new Player;
      $player_detail = $player_detail->with(['promotion']);
      $player_detail = $player_detail->with(['fighter_status']);
			$player_detail = $player_detail->where('player_unique_id',$player_unique_id);
			$player_detail = $player_detail->first();

			 return response()->json(['response_code'=> 200,'service_name' => 'get_player_unique_detail','data' => $player_detail]);
	}

	//update player injury status
	public function update_player(Request $request)
	{
		$player_unique_id = $request->post('player_unique_id');
  	$injury_status = $request->post('injury_status');
  	$results= Player::where('player_unique_id', $player_unique_id)->update(array('injury_status' => $injury_status));
  	if($results)
		{
			return response()->json(['response_code'=>200,'data'=>$results,'message' =>'Injury status updated successfully.']);
		}
		else
		{
			return response()->json(['response_code'=>500,'message' =>'Some Problem updating injury status.']);
		}
    }

    public function create_player(Request $request)
    {
        $data  = $request->post();
        $error = array();
        $rules = [];
        $rules['first_name'] = 'required';
        $rules['last_name'] ='required';
        //$rules['nick_name'] ='required';
        $rules['team_name'] ='required';
        $rules['promotion_id'] ='required';
        $rules['gender'] ='required';
        $rules['gym'] ='required';
        $rules['stance'] ='required';
        $rules['win'] ='required';
        $rules['loss'] ='required';
        $rules['draw'] ='required';
        $rules['dob'] ='required';
        $rules['weight'] ='required';
        $rules['height_feet'] ='required';
        $rules['height_inch'] ='required';
        $rules['player_image'] ='required';
        //$rules['bio'] ='required';
        $rules['player_status'] ='required';
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
                'player_unique_id'  => random_string('alnum',9),
                'first_name'        => strtolower($data['first_name']),
                'last_name'         => strtolower($data['last_name']),
                'full_name'         => strtolower($data['first_name']) .' '.strtolower($data['last_name']),
                'nick_name'         => $data['nick_name'],
                'team_name'         => $data['team_name'],
                'promotion_id'      => $data['promotion_id'],
                'player_status'      => $data['player_status'],
                'gender'            => $data['gender'],
                'gym'               => $data['gym'],
                'stance'            => $data['stance'],
                'win'               => $data['win'],
                'loss'              => $data['loss'],
                'draw'              => $data['draw'],
                'ko'                => $data['ko'],
                'sub'               => $data['submission'],
                'dob'               => $data['dob'],
                'weight'            => $data['weight'],
                'height_feet'       => $data['height_feet'],
                'height_inch'       => $data['height_inch'],
                'player_image'      => $data['player_image'],
                'bio'               => $data['bio']

            );

            // return $post_data;
            $players = Player::create($post_data);
            if($players)
            {
                return response()->json(['message'=>'player created successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }
            else
            {
                $image_path = \Config::get('constants.ROOT_IMAGE_PATH').$data['image_name'];
                if( file_exists($image_path) ){
                  unlink($image_path);
                }
                return response()->json(['message'=>'Please Try Create Player.'],500);
            }

        }
    }

    public function do_upload(Request $request)
    {
        $file = $request->file('file');
        // generate a new filename. getClientOriginalExtension() for the file extension


    	$file_field_name = 'file';
    	$temp_file = $_FILES['file']['tmp_name'];
    	$ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    	$vals = @getimagesize($temp_file);
		$width = $vals[0];
		$height = $vals[1];

		// $this->check_folder_exist($dir);
		$file_name = time() . "." . $ext;
		// return $file_name;
		$config['allowed_types'] = 'jpg|png|jpeg|gif';
		$config['max_size'] = '4048'; //204800
		$config['max_width'] = '1024';
		$config['max_height'] = '1000';
		// $config['upload_path'] = $dir;
		$config['file_name'] = $file_name;

        $path = "uploads/players";
         if (\Storage::disk('local')->exists($path))
          {
              \Storage::makeDirectory($path, 0777);
          }

        $path = $file->storeAs($path, $file_name);
        $data['image_path'] = \Config::get('constants.ROOT_IMAGE_PATH').$path;
		$data['file_name'] = $file_name;
		return response()->json(['data'=>$data])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);

	}

	public function edit_update_player(Request $request)
    {
        $data  = $request->post();
        $error = array();
        $rules = [];
        $rules['first_name'] = 'required';
        $rules['last_name'] ='required';
        //$rules['nick_name'] ='required';
        $rules['team_name'] ='required';
        $rules['promotion_id'] ='required';
        $rules['gender'] ='required';
        $rules['gym'] ='required';
        $rules['stance'] ='required';
        $rules['win'] ='required';
        $rules['loss'] ='required';
        $rules['draw'] ='required';
        $rules['dob'] ='required';
        $rules['weight'] ='required';
        $rules['height_feet'] ='required';
        $rules['height_inch'] ='required';
        $rules['player_status'] ='required';
        //$rules['player_image'] ='required';
        //$rules['bio'] ='required';
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
                'first_name'        => strtolower($data['first_name']),
                'last_name'         => strtolower($data['last_name']),
                'full_name'         => strtolower($data['first_name']) .' '.strtolower($data['last_name']),
                'nick_name'         => $data['nick_name'],
                'team_name'         => $data['team_name'],
                'promotion_id'      => $data['promotion_id'],
                'gender'            => $data['gender'],
                'gym'               => $data['gym'],
                'stance'            => $data['stance'],
                'win'               => $data['win'],
                'loss'              => $data['loss'],
                'draw'              => $data['draw'],
                'ko'                => $data['ko'],
                'sub'               => $data['submission'],
                'dob'               => $data['dob'],
                'weight'            => $data['weight'],
                'height_feet'       => $data['height_feet'],
                'height_inch'       => $data['height_inch'],
                //'player_image'      => $data['player_image'],
                'bio'               => $data['bio'],
                'player_status'               => $data['player_status']
			);
			if(isset($data['player_image'])){
				$post_data['player_image'] = $data['player_image'];
			}

			// return $post_data;
			//print_r($post_data); die;
            $players = Player::where('player_id',$data['player_id'])->update($post_data);
            if($players)
            {
                return response()->json(['message'=>'Fighter Update successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }
            else
            {
                $image_path = \Config::get('constants.ROOT_IMAGE_PATH').$data['image_name'];
                if( file_exists($image_path) ){
                  unlink($image_path);
                }
                return response()->json(['message'=>'Please Try Create Player.'],500);
            }

        }
    }

  public function delete_player(Request $request)
	{
    $player_id = $request->post('player_id');
    $match_res = Match::orWhere('home',$player_id)->orWhere('away',$player_id)->first();
    //print_r($match_res); die;
    if(!empty($match_res))
    {
      return response()->json(['message'=>'Permission denied. player exist in match list'],500);
    }else{
      $res = Player::find($player_id)->delete();
		  return response()->json(['results'=>$res,'message'=>'Player deleted susscssfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
    }
  }

  //get_all_players post method
  public function fighter_status(Request $request)
  {
		$fighter_status = FighterStatuses::all();

	  return response()->json(['response_code'=> 200,'service_name' => 'get_fighter_status','data' => $fighter_status,'message'=> 'get_fighter_status']);
  }

}
