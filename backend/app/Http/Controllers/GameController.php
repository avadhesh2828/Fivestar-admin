<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use App\Models\GameType;
use Auth;
use DB;
use Validator;
use Illuminate\Support\Facades\Gate;

class GameController extends Controller
{
    /**
     * Display a listing of the Game.
     *
     */
    public function index(Request $request)
    {
        $this->user = Auth::user();
        $user_id = $this->user->admin_id;

        $game = new Game;
        $game = $game->select('game.*','GT.game_type'); 
        $game = $game->join((new GameType)->getTable().' as GT', function($m){
            $m->on('GT.game_type_id', '=', 'game.game_type_id');
        });
      
        if($request->status != -1){
            $game = $game->where('status', $request->status);    
        }
        if($request->keyword != ''){
            $game = $game->where('name', 'ilike', '%' . $request->keyword . '%');
        }
        $game = $game->orderBy('id','ASC');
        $game = $game->paginate($request->per_page);
        return response()->json(['response_code'=> 200, 'service_name' => 'game_list', 'data' => $game],200);
    }

    /**
     * Change Game status.
     *
     */
    public function change_game_status($game_id, Request $request)
    {
        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;

        $status = $request->post('status');
        //validation
        $validator = Validator::make($request->all(), [
            "status" => ['required']
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'change_game_status',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $update = Game::where('id', $game_id)->update(["status" => $status, "updated_at"  => date('Y-m-d H:i:s')]);
        if($update > 0){
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_game_status',
                'message'=> 'Game status changed Successfully',
            ],200);
        }else{
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_game_status',
                'message'=> 'Someting wrong for updating game status',
            ],500);
        }
    }

    /**
     * Game details.
     *
     */
    public function get_game_details($gameId) {
        
        $game = new Game;
        $game = $game->select('game.*','GT.game_type'); 
        $game = $game->with(['provider']); 
        $game = $game->join((new GameType)->getTable().' as GT', function($m){
            $m->on('GT.game_type_id', '=', 'game.game_type_id');
        });
        $game = $game->where('id', $gameId);
        $game = $game->first();

        return response()->json(['response_code'=> 200,'service_name' => 'get_game_details', 'message' => 'Game details', 'data' => $game ],200);  
    }

}