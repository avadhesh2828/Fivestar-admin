<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

# Models
use App\Models\PaymentHistoryTransaction;
use App\Models\Notification_model;
use App\Models\User;
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
        $gameHistory = $gameHistory->select('payment_history_transactions.*', 'U.username', DB::raw("(CASE WHEN payment_history_transactions.action = 'FiveStar Blessing' THEN payment_history_transactions.action ELSE NULL END) AS action"));
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
      
      $report = new PaymentHistoryTransaction;
      $report = $report->select('payment_history_transactions.created_at', DB::raw("SUM(payment_history_transactions.win) as win_amount"));
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
      $report = $report->groupBy('payment_history_transactions.created_at');
      // Paginated records
      $report = $report->paginate($request->per_page);
  
      if($report->count() == 0){
        return response()->json([
          'response_code'=> 500,
          'service_name' => 'game_report',
          'data' => [],
          'message'=> 'No reports found',
          'global_error'=> 'No reports found',
        ]);
      }
  
      return response()->json([
        'response_code'=> 200,
        'service_name' => 'game_report',
        'data' => $report,
        'message'=> 'Reports found',
      ]);
    }

}
