<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

# Models
use App\Models\PaymentHistoryTransaction;

class DepositController extends Controller
{
  public function deposit_list( Request $request ){
    \DB::enableQueryLog();
    $historyTransaction = new PaymentHistoryTransaction;

    // Bring up only deposit history
    $historyTransaction = $historyTransaction->whereNull('payment_withdraw_transaction_id');
    // Eager load relationship
    $historyTransaction = $historyTransaction->with(['payment_deposit_transaction', 'user']);

    // Payment Type Filter
    if( $request->payment_type != "" ){
      $historyTransaction = $historyTransaction->where('payment_type', $request->payment_type);
    }

    // Date Range Filter
    $dates = json_decode($request->dates);
    if( isset($dates->fromdate) && isset($dates->todate) ){
      $historyTransaction = $historyTransaction->whereBetween('created_date', [$dates->fromdate , $dates->todate]);
    }

    // Status Filter (Relationship) Filter
    $historyTransaction = $historyTransaction->whereHas('payment_deposit_transaction', function($q) use ($request){
      if( $request->status != "" ){
        $q->where('status', $request->status);
      }
    });

    // Partial Keyword Search Filter (Relationship) Filter
    $historyTransaction = $historyTransaction->whereHas('user', function($q) use ($request){
      if( $request->keyword != "" ){
        $q->where('email', 'LIKE', '%'.$request->keyword.'%')
        ->orWhereRaw('LOWER(user_name) LIKE \'%'.$request->keyword.'%\'');
      }
    });

    // Paginated records
    $historyTransaction = $historyTransaction->paginate($request->perPage);

    if($historyTransaction->count() == 0){
      return response()->json([
        'response_code'=> 404,
        'service_name' => 'deposit_list',
        'global_error'=> 'No history transaction found',
      ]);
    }

    return response()->json([
      'response_code'=> 200,
      'service_name' => 'deposit_list',
      'data' => $historyTransaction,
      'message'=> 'History transaction found',
    ]);
  }
}
