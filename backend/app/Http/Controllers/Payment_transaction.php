<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Transaction_model;
use Carbon\Carbon;
use DB;


class Payment_transaction extends Controller
{
    //

    public function get_all_transaction(Request $request)
    {
	        $sort_field = 'PHT.created_date';
		    $sort_order = 'DESC';
		    $limit = 10;
		    $page = 0;
		    $post_data = $request->all();

			if (isset($post_data['items_perpage']) && $post_data['items_perpage'] != 0) {
	      		$limit = $post_data['items_perpage'];
	    	}
			if (isset($post_data['current_page']) && $post_data['current_page'] != 0) {
		      $page = $post_data['current_page'] - 1;
		    }
			if (isset($post_data['sort_field']) && in_array($post_data['sort_field'], array('U.user_name', 'PHT.description', 'PHT.transaction_amount', 'user_balance_at_transaction', 'PHT.payment_type', 'PHT.created_date', 'PHT.is_processed'))) {
	      		$sort_field =  $post_data['sort_field'];
	    	}	
			if (isset($post_data['sort_order']) && in_array($post_data['sort_order'], array('DESC', 'ASC'))) {
     		 	$sort_order = $post_data['sort_order'];
    		}
			$offset = $limit * $page;
			$query = DB::table('finanace.payment_history_transactions as PHT');
			$query->select('PHT.user_id', 'PHT.gateway_transaction_id','PHT.amount','PHT.currency_code','PHT.gateway_customer_id','PHT.gateway_customer_global_id','PHT.created_date','PHT.payment_withdraw_transaction_id','PHT.description','PHT.is_processed','PHT.payment_type','PHT.payment_history_transaction_id','PHT.payment_for','U.user_id','U.user_name','P.full_name as player_name');
			$query->selectRaw('CONCAT("U"."first_name", \' \',"U"."last_name") as name');
			$query->Join('users.user as U','U.user_id','=','PHT.user_id');
			$query->leftJoin('game.players as P','P.player_id','=','PHT.player_id');

			//Query by payment_type
    		if (isset($post_data['payment_type']) && $post_data['payment_type'] != "-1") {
    			$query->where('payment_type', $post_data['payment_type']);
	    	}
			//Query by payment for
			if (isset($post_data['payment_for']) && $post_data['payment_for'] != "-1") {
	     		$query->where('payment_for', $post_data['payment_for']);
	     	}
			//Query by Status
			if (isset($post_data['is_processed']) && $post_data['is_processed'] != "-1") {
	    		$query->where('is_processed', $post_data['is_processed']);
   			}
			//Query by from date -to date
			// if (isset($post_data['fromdate']) && $post_data['fromdate'] != "" && isset($post_data['todate']) && $post_data['todate'] != "" && isset($post_data['time_zone']) && $post_data['time_zone'] != "") {

	  //    		$min_date = Carbon::parse($post_data['todate']);
			// 	$max_date = Carbon::parse($post_data['fromdate']);
			// 	$query->whereDate('PHT.created_date','<=',$min_date->format('m-d-y'));
  	// 			$query->whereDate('PHT.created_date','>=',$max_date->format('m-d-y'));
	  //    	}

   			//Query by from date -to date
			if (isset($post_data['fromdate']) && $post_data['fromdate'] != "" && isset($post_data['todate']) && $post_data['todate'] != "" && isset($post_data['time_zone']) && $post_data['time_zone'] != "") {


				$min_date = new \DateTime($post_data["fromdate"], new \DateTimeZone($post_data["time_zone"]));

				$min_date->setTimezone(new \DateTimeZone('UTC'));

				$max_date = new \DateTime($post_data["todate"], new \DateTimeZone($post_data["time_zone"]));

				$max_date->setTimezone(new \DateTimeZone('UTC'));

				$query->whereDate('PHT.created_date','>=',$min_date->format('Y-m-d H:i:s'));
				$query->whereDate('PHT.created_date','<=',$max_date->format('Y-m-d H:i:s'));
	     	}

			//Query by keyword
			if (isset($post_data['keyword']) && $post_data['keyword'] != "") {

				// $query->whereHas('user', function($query) use ($post_data){
	                 $query->where('U.user_name', 'ilike', '%'.$post_data['keyword'].'%');
	                 $query->orWhere('P.full_name', 'ilike', '%'.$post_data['keyword'].'%');
	                 $query->orWhere(DB::raw('CONCAT("U"."first_name",\' \',"U"."last_name")'), 'ilike', '%'.$post_data['keyword'].'%');
	            // });
		    }
			$tempdb = clone $query;
	    	$query = $query->get();
			$total = $query->count();
			$sql = $tempdb->orderBy($sort_field, $sort_order)->offset($offset)->limit($limit)
			      ->get();
			$result['result'] = $sql;
			$result['total'] = $total;

	    	return response()->json(['status'=>'susscss','data'=>$result])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]); 

    }

    public function make_payment_transaction($data_arr)
    {
		$response = new Transaction_model;  // result "App\Dogs"
		$response->user_id = $data_arr['user_id']; 
		$response->description = $data_arr['description']; 
		$response->payment_type =  $data_arr['payment_type']; 
		$response->payment_for =  $data_arr['payment_for']; 
		$response->amount = $data_arr['amount'];
		$response->created_date = $data_arr['created_date'];
		$response->is_processed = $data_arr['is_processed'];
		$response->save();    // result "true"

		return response()->json(['status'=>'susscss','response'=>$response])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);

    }
}
