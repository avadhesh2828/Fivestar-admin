<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

# Models
use App\Models\PaymentHistoryTransaction;
use App\Models\Notification_model;
use App\Models\User;
use App\Models\Agent;
use Auth;
use Validator;
use DB;

class GameHistoryController extends Controller
{
    /**
     * Display a listing of the Game History
     *
     */
    public function game_history( Request $request ){
        $username = $request->post('username');
        $dates    = $request->post('dates');

        $validator = Validator::make($request->all(),[
        'username' => 'required|numeric',
        'dates'    => 'required'
        ]);

        if($validator->fails() ){
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'game_history',
                'message'=> 'Validation Failed',
                'global_error'=> $validator->errors(),
            ]);
        }
        
        $gameHistory = new PaymentHistoryTransaction;
        $gameHistory = $gameHistory->select('payment_history_transactions.*', 'U.username', DB::raw("(CASE WHEN payment_history_transactions.action = 'FiveStar Blessing' OR payment_history_transactions.action = 'SetScore' THEN payment_history_transactions.action ELSE NULL END) AS action"));
        $gameHistory = $gameHistory->with(['game_detail']);
        $gameHistory = $gameHistory->join((new User)->getTable().' as U', function($j){
            $j->on('U.user_id', '=', 'payment_history_transactions.user_id');
        });
    
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
            $gameHistory = $gameHistory->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }
    
        $gameHistory = $gameHistory->where('U.username', $username);
        $gameHistory = $gameHistory->orderBy('payment_history_transactions.payment_history_transaction_id', 'DESC');
        // Paginated records
        $gameHistory = $gameHistory->paginate($request->per_page);
    
        if($gameHistory->count() == 0){
          return response()->json([
            'response_code'=> 500,
            'service_name' => 'game_history',
            'data' => [],
            'message'=> 'No game history found',
            'global_error'=> 'No game history found',
          ]);
        }
    
        return response()->json([
          'response_code'=> 200,
          'service_name' => 'game_history',
          'data' => $gameHistory,
          'message'=> 'Game history found',
        ]);
    }

    /**
     * Display a listing of the Game Reports
     *
     */
    public function game_report( Request $request ){
      $player_id = $request->post('player_id');
      $game_type_id = $request->post('game_type_id');
      $dates    = $request->post('dates');

      $validator = Validator::make($request->all(),[
      'player_id'    => 'required',
      'game_type_id' => 'required',
      'dates'        => 'required'
      ]);

      if($validator->fails() ){
          return response()->json([
              'response_code'=> 400,
              'service_name' => 'game_report',
              'message'=> 'Validation Failed',
              'global_error'=> $validator->errors(),
          ]);
      }
      
      $report = $this->playerReport($player_id, $game_type_id, $dates);
      $bet = $report->get()->sum('bet');
      $win = $report->get()->sum('win');
      $total_win = $bet - $win;
      // Paginated records
      $report = $report->paginate($request->per_page);
  
      if($report->count() == 0){
        return response()->json([
          'response_code' => 500,
          'service_name'  => 'game_report',
          'bet'           => $bet,
          'win'           => $win,
          'total_win'     => $total_win,
          'data'          => [],
          'message'       => 'No reports found',
          'global_error'  => 'No reports found',
        ]);
      }
  
      return response()->json([
        'response_code' => 200,
        'service_name'  => 'game_report',
        'bet'           => $bet,
        'win'           => $win,
        'total_win'     => $total_win,
        'data'          => $report,
        'message'       => 'Reports found',
      ]);
    }

    private function playerReport($player_id, $game_type_id, $dates)
    {
        $report = new PaymentHistoryTransaction;
        $report = $report->select(DB::raw('DATE(payment_history_transactions.created_at) as created_at'), DB::raw("ROUND(SUM(payment_history_transactions.bet)) as bet") , DB::raw("ROUND(SUM(payment_history_transactions.win)) as win"));
        $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
      
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
          $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }
        $report = $report->where('payment_history_transactions.user_id', $player_id);
        if($game_type_id == '1') {
          $report = $report->where('game.game_type_id', 6);
          $report = $report->whereNotNull('payment_history_transactions.table_id');
        }
        $report = $report->where('payment_history_transactions.game_id', '!=', 0);
        $report = $report->groupBy(DB::raw('DATE(payment_history_transactions.created_at)'));
        $report = $report->orderBy('created_at', 'DESC');
        return $report = $report;
    }


    /**
     * Display a listing of the Agent Game Reports
     *
     */
    public function agent_game_report( Request $request ){
        $this->user = Auth::user();
        $agent_id = $request->post('agent_id');
        $game_type_id = $request->post('game_type_id');
        $dates    = $request->post('dates');

        $validator = Validator::make($request->all(),[
        'agent_id'     => 'required',
        'game_type_id' => 'required',
        'dates'        => 'required'
        ]);

        if($validator->fails() ){
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'agent_game_report',
                'message'=> 'Validation Failed',
                'global_error'=> $validator->errors(),
            ]);
        }

        $agentIds = $this->getChildren($agent_id);
        $report = $this->get_agent_report($agentIds, $game_type_id, $dates);
        $bet = $report->get()->sum('bet');
        $win = $report->get()->sum('win');
        $total_win = $bet - $win;
      
        // Paginated records
        $report = $report->paginate($request->per_page);
        if($report->count() == 0){
          return response()->json([
            'response_code'=> 500,
            'service_name' => 'agent_game_report',
            'bet'          => $bet,
            'win'          => $win,
            'total_win'    => $total_win,
            'data'         => [],
            'message'      => 'No reports found',
            'global_error' => 'No reports found',
          ]);
        }
        return response()->json([
          'response_code'=> 200,
          'service_name' => 'agent_game_report',
          'bet'          => $bet,
          'win'          => $win,
          'total_win'    => $total_win,
          'data'         => $report,
          'message'      => 'Reports found',
        ]);
    }

    /**
     * Display a listing of the Agent Game Reports
     *
     */
    public function all_agent_report( Request $request )
    {
        $agent_id = $request->post('agent_id');
        $game_type_id = $request->post('game_type_id');
        $dates    = $request->post('dates');

        $validator = Validator::make($request->all(),[
        'agent_id'     => 'required',
        'game_type_id' => 'required',
        'dates'        => 'required'
        ]);

        if($validator->fails() ){
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'all_agent_report',
                'message'=> 'Validation Failed',
                'global_error'=> $validator->errors(),
            ]);
        }

        $report = new User;
        $report = $report->select('admins.username', 'admins.name', 'admins.phone', 'admins.description', DB::raw('DATE(payment_history_transactions.created_at) as created_at'), DB::raw("SUM(payment_history_transactions.bet) as bet"), DB::raw("SUM(payment_history_transactions.win) as win"));
        $report = $report->join('users.admins', 'admins.admin_id', '=', 'user.parent_id');
        $report = $report->join('finanace.payment_history_transactions', 'user.user_id', '=', 'payment_history_transactions.user_id');
        $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
      
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
          $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }
        $report = $report->where('user.parent_id', $agent_id);
        if($game_type_id == '1') {
          $report = $report->where('game.game_type_id', 6);
          $report = $report->whereNotNull('payment_history_transactions.table_id');
        }
        $report = $report->where('payment_history_transactions.action', '!=', 'SetScore');
        $report = $report->groupBy('admins.username', 'admins.name', 'admins.phone', 'admins.description', DB::raw('DATE(payment_history_transactions.created_at)'));
        $report = $report->orderBy('created_at','DESC');

        $bet = $report->get()->sum('bet');
        $win = $report->get()->sum('win');
        $total_win = $bet - $win;
      
        // Paginated records
        $report = $report->paginate($request->per_page);
        if($report->count() == 0){
          return response()->json([
            'response_code'=> 500,
            'service_name' => 'all_agent_report',
            'bet'          => $bet,
            'win'          => $win,
            'total_win'    => $total_win,
            'data'         => [],
            'message'      => 'No reports found',
            'global_error' => 'No reports found',
          ]);
        }

        return response()->json([
          'response_code'=> 200,
          'service_name' => 'all_agent_report',
          'bet'          => $bet,
          'win'          => $win,
          'total_win'    => $total_win,
          'data'         => $report,
          'message'      => 'Reports found',
        ]);
    }

    private function getOneLevel($catId){
        $agentIds = agent::select('admin_id','parent_id')->where('parent_id', $catId)->get();
        $cat_id=array();
        if(count($agentIds)>0){
            foreach($agentIds as $key) {
              $cat_id[]=$key->admin_id; 
            }
        }   
        return $cat_id;
    }
    
    private function getChildren($parent_id) 
    {
        // $this->user = Auth::user();
        $tree_string=array($parent_id);
        $tree = array();
        // getOneLevel() returns a one-dimensional array of child ids        
        $tree = $this->getOneLevel($parent_id);     
        if(count($tree)>0 && is_array($tree)){    
            $tree_string=array_merge($tree_string,$tree);
        }
        foreach ($tree as $key => $val) {
            $tree = $this->getOneLevel($val);
            $tree_string=array_merge($tree_string,$tree);
        }
        return $tree_string;
    }

    private function get_agent_report($agentIds, $game_type_id, $dates)
    {
        $report = new User;
        $report = $report->select('payment_history_transactions.created_date', DB::raw("SUM(payment_history_transactions.bet) as bet"), DB::raw("SUM(payment_history_transactions.win) as win"));
        $report = $report->join('finanace.payment_history_transactions', 'user.user_id', '=', 'payment_history_transactions.user_id');
        $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
      
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
          $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }
        // $report = $report->where('user.parent_id', $agent_id);
        $report = $report->whereIn('user.parent_id', $agentIds);
        if($game_type_id == '1') {
          $report = $report->where('game.game_type_id', 6);
          $report = $report->whereNotNull('payment_history_transactions.table_id');
        }
        $report = $report->where('payment_history_transactions.action', '!=', 'SetScore');
        $report = $report->groupBy('payment_history_transactions.created_date');
        $report = $report->orderBy('payment_history_transactions.created_date','DESC');
        return $report = $report;
    }


}
