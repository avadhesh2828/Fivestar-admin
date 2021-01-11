<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use App\Models\GameType;
use App\Models\GameProvider;
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
        if($request->category != -1){
            $game = $game->where('game.game_type_id', $request->category);    
        }
        if($request->provider != -1){
            $game = $game->where('game.provider_id', $request->provider);    
        }
        if($request->keyword != ''){
            $game = $game->where('name', 'ilike', '%' . $request->keyword . '%');
        }
        $game = $game->orderBy('position','ASC');
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
     * Change featured status.
     *
     */
    public function change_featured($game_id, Request $request)
    {
        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;

        $is_featured = $request->post('is_featured');
        //validation
        $validator = Validator::make($request->all(), [
            "is_featured" => ['required']
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'change_featured',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $is_featured = ($is_featured == 1)? 'true':'false';
        $update = Game::where('game_id', $game_id)->update(["is_featured" => $is_featured, "updated_at"  => date('Y-m-d H:i:s')]);
        if($update > 0){
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_featured',
                'message'=> 'featured status changed Successfully',
            ],200);
        }else{
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_featured',
                'message'=> 'Someting wrong for updating featured status',
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

    /**
     * Change featured status.
     *
     */
    public function change_position($id, Request $request)
    {
        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;

        $position     = $request->post('position');
        $game_type_id = $request->post('game_type_id');
        //validation
        $validator = Validator::make($request->all(), [
            "position" => ['required']
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'change_position',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $allPosition = Game::select('id','position')->where('position', '>=', $position)->whereNotIn('id', [$id])->orWhereNull('position')->orderBy('position', 'ASC')->get();
        if(count($allPosition) > 0) {
            $postion_count = $position;
            foreach($allPosition as $pos) {
                $update = Game::where('id', $pos->id)->update(["position" => $postion_count + 1, "updated_at"  => date('Y-m-d H:i:s')]);
                $postion_count ++;
            }
            if($game_type_id != ''){
                $update_data = array(
                    "position"     => $position, 
                    "game_type_id" => $game_type_id,
                    "updated_at"   => date('Y-m-d H:i:s')
                );    
            }else{
                $update_data = array(
                    "position"    => $position, 
                    "updated_at"  => date('Y-m-d H:i:s')
                ); 
            }
            Game::where('id', $id)->update($update_data);
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_position',
                'message'=> 'position changed Successfully',
            ],200);
        } else {
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_position',
                'message'=> 'Someting wrong for updating position',
            ],500);
        }
    }

    /**
     * game categories.
     *
     */
    public function get_categories(Request $request){
        $category = GameType::get();
        return response()->json(['response_code'=> 200,'service_name' => 'get_categories','data' => $category]);
    }

    /**
     * game provider.GameType
     *
     */
    public function get_provider(Request $request){
        $provider = GameProvider::get();
        return response()->json(['response_code'=> 200,'service_name' => 'get_provider','data' => $provider]);
    }


}