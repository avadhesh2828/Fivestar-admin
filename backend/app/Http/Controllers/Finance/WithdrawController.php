<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

# Models
use App\Models\PaymentWithdrawTransaction;
use App\Models\PaymentHistoryTransaction;
use App\Models\History;
use App\Models\Notification_model;
use App\Models\User;
use Auth;

# Helpers & Libraries
use Validator;
use App\Helpers\Paypal;

class WithdrawController extends Controller
{

  public function transaction_history( Request $request ) {
    $this->user = Auth::user();
    $user_id = $this->user->admin_id;
    $role_id = $this->user->role_id;

    $history = new History;
    $history = $history->with(['agent_detail']);
    if($role_id == 2 ) {
      $history = $history->where('from_id', $user_id);  
    }
    // Date Range Filter
    $dates = json_decode($request->dates);
    if( isset($dates->fromdate) && isset($dates->todate) ){
      $history = $history->whereBetween('history.created_at', [$dates->fromdate , $dates->todate]);
    }
    if( $request->keyword != "" ){
        $history = $history->where('name', 'LIKE', '%'.$request->keyword.'%');
    }
    if( $request->status != "" ){
      $history = $history->where('action_for', $request->status);
    }
    $history = $history->orderBy('history_id', 'DESC');
    $history = $history->limit(1000);
    // Paginated records
    $history = $history->paginate($request->perPage);

    if($history->count() == 0){
      return response()->json([
        'response_code'=> 500,
        'service_name' => 'transaction_history',
        'data' => [],
        'global_error'=> 'No history transaction found',
      ], 500);
    }

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'transaction_history',
      'data' => $history,
      'message'=> 'History transaction found',
    ],200);
} 

  // public function transaction_history( Request $request ) {
  //     $this->user = Auth::user();
  //     $user_id = $this->user->admin_id;
  //     $role_id = $this->user->role_id;

  //     $historyTransaction = new PaymentHistoryTransaction;
  //     $historyTransaction = $historyTransaction->select('payment_history_transactions.*', 'U.username');
  //     $historyTransaction = $historyTransaction->join((new User)->getTable(). ' as U', function($j) {
  //       $j->on('U.user_id', '=', 'payment_history_transactions.user_id');
  //     });

  //     if($role_id == 2 ) {
  //       $historyTransaction = $historyTransaction->where('U.parent_id', $user_id);  
  //     }
      
  //     // Date Range Filter
  //     $dates = json_decode($request->dates);
  //     if( isset($dates->fromdate) && isset($dates->todate) ){
  //       $historyTransaction = $historyTransaction->whereBetween('payment_history_transactions.created_at', [$dates->fromdate , $dates->todate]);
  //     }

  //     if( $request->keyword != "" ){
  //         $historyTransaction = $historyTransaction->where('U.username', 'LIKE', '%'.$request->keyword.'%');
  //     }

  //     // Paginated records
  //     $historyTransaction = $historyTransaction->paginate($request->perPage);

  //     if($historyTransaction->count() == 0){
  //       return response()->json([
  //         'response_code'=> 200,
  //         'service_name' => 'transaction_history',
  //         'data' => [],
  //         'global_error'=> 'No history transaction found',
  //       ], 200);
  //     }

  //     return response()->json([
  //       'response_code'=> 200,
  //       'service_name' => 'transaction_history',
  //       'data' => $historyTransaction,
  //       'message'=> 'History transaction found',
  //     ],200);
  // }  


  public function withdraw_list( Request $request ){

    \DB::enableQueryLog();
    $withdrawTransaction = new PaymentWithdrawTransaction;

    // Eager load relationship
    $withdrawTransaction = $withdrawTransaction->with(['user']);

    // Status Filter
    if( $request->status != "" ){
      $withdrawTransaction = $withdrawTransaction->where('status', $request->status);
    }

    // Withdraw Type Filter
    if( $request->withdraw_type != "" ){
      $withdrawTransaction = $withdrawTransaction->where('withdraw_type', $request->withdraw_type);
    }

    // Date Range Filter
    $dates = json_decode($request->dates);
    if( isset($dates->fromdate) && isset($dates->todate) ){
      $withdrawTransaction = $withdrawTransaction->whereBetween('created_date', [$dates->fromdate , $dates->todate]);
    }

    // Partial Keyword Search Filter (Relationship) Filter
    $withdrawTransaction = $withdrawTransaction->whereHas('user', function($q) use ($request){
      if( $request->keyword != "" ){
        $q->where('email', 'LIKE', '%'.$request->keyword.'%')
        ->orWhereRaw('LOWER(user_name) LIKE \'%'.$request->keyword.'%\'');
      }
    });

    // Paginated Records
    $withdrawTransaction = $withdrawTransaction->orderBy('payment_withdraw_transaction_id','DESC');
    $withdrawTransaction = $withdrawTransaction->paginate($request->perPage);

    if($withdrawTransaction->count() == 0){
      return response()->json([
        'response_code'=> 404,
        'service_name' => 'withdraw_list',
        'global_error'=> 'No withdraw transaction found',
      ]);
    }

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'withdraw_list',
      'data' => $withdrawTransaction,
      'message'=> 'Withdraw transaction found',
    ]);
  }

  public function manage_status( Request $request )
  {

    $withdrawDetails = $request->post('withdraw_details');
    
    $validator = Validator::make($withdrawDetails,[
      'transaction_unique_id' => ['required'],
      'status' => ['required'],
    ]);

    if( $validator->fails() ){

      return response()->json([
        'response_code'=> 400,
        'service_name' => 'withdraw_request',
        'message'=> 'Validation Failed',
        'global_error'=> $validator->errors(),
      ]);
    }

    $withdrawal = PaymentWithdrawTransaction::where('transaction_unique_id', $withdrawDetails['transaction_unique_id'])
    // ->where('status', 0)
    ->first();

    if ($withdrawal->user->winning_balance < $withdrawal->amount && $withdrawDetails['status'] == 1)
    {
      $withdrawal->status = 2;
      $withdrawal->save();
      $notification = array(
        'notification_type_id' => 12,
        'sender_user_id' => 0,
        'receiver_user_id' => $withdrawal->user_id,
        'is_read' => 0,
        'created_date' => format_date(),
        'updated_date' => format_date(),
      );
      $notification['notification'] = 'Sorry your Amount $' .	$withdrawal->amount . ' withdrawal request has been rejected by admin due to insufficient winning balance';

      Notification::create($notification);

      return response()->json([
        'response_code'=> 422,
        'service_name' => 'manage_status',
        'global_error'=> 'Insufficient funds in winning balance',
      ],422);
    }
     
    $notification = array(
      'notification_type_id' => 12,
      'sender_user_id' => 0,
      'receiver_user_id' => $withdrawal->user_id,
      'is_read' => 0,
      'created_date' => format_date(),
      'updated_date' => format_date(),
    );

    # on approve
    if ($withdrawDetails['status'] == 1) {
      if( !empty($withdrawal->email) ){
        $withdraw_type = 'EMAIL';
        $withdrawal_type_value = $withdrawal->email;
      } else if( !empty($withdrawal->phone) ){
        $withdraw_type = 'PHONE';
        $withdrawal_type_value = $withdrawal->phone;
      }
      $payout = Paypal::send_payout('USD', $withdrawal->amount, $withdraw_type, $withdrawal_type_value);
      if($payout === FALSE){
        return response()->json([
          'response_code'=> 500,
          'service_name' => 'manage_status',
          'global_error'=> 'Unable to process request at the moment',
        ],500);
      }
      if($payout->batch_status == 'PENDING' || $payout->batch_status == 'SUCCESS') {

        # Deduct user balance
        $withdrawal->user->winning_balance -= $withdrawal->amount;
        $withdrawal->user->save();

        # Update withdraw status
        $withdrawal->status = 1;
        $withdrawal->paypal_status = $payout->batch_status;
        $withdrawal->payout_batch_id = $payout->payout_batch_id;
        $withdrawal->save();

        return response()->json([
          'response_code'=> 200,
          'service_name' => 'manage_withdraw',
          'data' => [
            'payout_batch_id' => $payout->payout_batch_id,
            'paypal_status' => $payout->batch_status ],
          'message'=> 'Withdraw initiated successfully',
        ]);

      } else {
        return response()->json([
          'response_code'=> 500,
          'service_name' => 'manage_status',
          'global_error'=> 'Payout request failed, Please try again later',
        ],500);
      }

    } else if ($withdrawDetails['status'] == 2) {

      $withdrawal->status = 2;
      $withdrawal->save();

      $notification['notification'] = 'Sorry your Amount $' .	$withdrawal->amount . ' withdrawal request has been rejected by admin';

      Notification_model::create($notification);

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'manage_withdraw',
        'message'=> 'Withdraw request has been rejected successfully',
      ]);

    } else {
      return response()->json([
        'response_code'=> 422,
        'service_name' => 'withdraw_request',
        'message'=> 'Validation Failed',
        'global_error'=> 'Status is not valid',
      ],422);
    }
  }
}
