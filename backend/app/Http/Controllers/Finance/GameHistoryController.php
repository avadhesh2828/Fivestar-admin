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
      $total_bet = $report->get()->sum('bet');
      $total_win = $report->get()->sum('win');
      $total = $total_bet - $total_win;
      // Paginated records
      $report = $report->paginate($request->per_page);
  
      if($report->count() == 0){
        return response()->json([
          'response_code' => 500,
          'service_name'  => 'game_report',
          'total_bet'     => $total_bet,
          'total_win'     => $total_win,
          'total'         => $total,
          'data'          => [],
          'message'       => 'No reports found',
          'global_error'  => 'No reports found',
        ]);
      }
  
      return response()->json([
        'response_code' => 200,
        'service_name'  => 'game_report',
        'total_bet'     => $total_bet,
        'total_win'     => $total_win,
        'total'         => $total,
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


      $report = $this->individual_agent_report($agent_id, $game_type_id, $dates);
      $total_bet = $report->get()->sum('bet');
      $total_win = $report->get()->sum('win');
      $total = $total_bet - $total_win;
      
      // Paginated records
      $report = $report->paginate($request->per_page);
  
      if($report->count() == 0){
        return response()->json([
          'response_code'=> 500,
          'service_name' => 'agent_game_report',
          'total_bet'    => $total_bet,
          'total_win'    => $total_win,
          'total'        => $total,
          'data'         => [],
          'message'      => 'No reports found',
          'global_error' => 'No reports found',
        ]);
      }
  
      return response()->json([
        'response_code'=> 200,
        'service_name' => 'agent_game_report',
        'total_bet'    => $total_bet,
        'total_win'    => $total_win,
        'total'        => $total,
        'data'         => $report,
        'message'      => 'Reports found',
      ]);
    }


    private function individual_agent_report($agent_id, $game_type_id, $dates)
    {
        $report = new User;
        $report = $report->select('user.username', 'user.name', 'user.phone', 'user.description', DB::raw("ROUND(SUM(payment_history_transactions.bet)) as bet"), DB::raw("ROUND(SUM(payment_history_transactions.win)) as win"));
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
        $report = $report->where('payment_history_transactions.transaction_id', '!=', 'null');
        $report = $report->groupBy('user.username', 'user.name', 'user.phone', 'user.description');
    }

    /**
     * Display a listing of the Agent Game Reports
     *
     */
    public function all_agent_report( Request $request ){
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


      $report = new Agent;
      $report = $report->select('admins.admin_id','admins.username', 'admins.name', 'admins.phone', 'admins.description', 'admins.parent_id', DB::raw("ROUND(SUM(payment_history_transactions.bet)) as bet"), DB::raw("ROUND(SUM(payment_history_transactions.win)) as win"));  
      $report = $report->join('users.user', 'user.parent_id', '=', 'admins.admin_id');
      $report = $report->join('finanace.payment_history_transactions', 'user.user_id', '=', 'payment_history_transactions.user_id');
      $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
    
      // Date Range Filter
      if( isset($dates['fromdate']) && isset($dates['todate']) ){
        $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
      }
      if($game_type_id == '1') {
        $report = $report->where('game.game_type_id', 6);
        $report = $report->whereNotNull('payment_history_transactions.table_id');
      }
      $report = $report->where('admin_id', '!=',$agent_id);
      $report = $report->where('payment_history_transactions.transaction_id', '!=', 'null');
      $report = $report->groupBy('admins.admin_id','admins.username', 'admins.name', 'admins.phone', 'admins.description', 'admins.parent_id');
      // Paginated records
      $report = $report->paginate($request->per_page);
 
      if($report->count() == 0){
        return response()->json([
          'response_code'=> 500,
          'service_name' => 'all_agent_report',
          'data' => [],
          'message'=> 'No reports found',
          'global_error'=> 'No reports found',
        ]);
      }
  
      return response()->json([
        'response_code'=> 200,
        'service_name' => 'all_agent_report',
        'data' => $report,
        'message'=> 'Reports found',
      ]);
    }

}
