<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\User;
use App\Models\User_Portfolio;
use App\Models\User_Watchlist;
use DB;
use App\Http\Controllers\Payment_transaction;
use App\Exports\UsersExport;
use Excel;
use PDF;
use App;


class UserController extends Controller
{
    //define here constructor
	protected $transaction;
    public function __construct(Payment_transaction $transaction)
    {
    	$this->transaction = $transaction;
    }
	//this function get all user detail
    public function getUser(Request $request)
    {
   	    $sort_field = 'U.created_date';
	    $sort_order = 'DESC';
	    $limit = 10;
	    $page = 0;
	    $post_data = $request->all();
    	try
    	{
    	    if ($post_data['items_perpage'] && $post_data['items_perpage'] != 0) {
		      $limit = $post_data['items_perpage'];
		    }
		    if ($post_data['current_page'] && $post_data['current_page'] != 0) {
		      $page = $post_data['current_page'] - 1;
		    }
		    if (isset($post_data['sort_field']) && in_array($post_data['sort_field'], array('created_date', 'first_name', 'user_name', 'email', 'country', 'status'))) {
		      $sort_field = $post_data['sort_field'];
		    }
		    if (isset($post_data['sort_order']) && in_array($post_data['sort_order'], array('DESC', 'ASC'))) {
		      $sort_order = $post_data['sort_order'];
		    }
			$offset = $limit * $page;
			// Start the query
			$query = DB::table('users.user as U');
			$query->select('U.user_id','U.user_unique_id','U.first_name','U.last_name','U.user_name','U.phone_number','U.status','U.email','U.password','U.balance','U.dob','U.status','U.status_reason','U.new_password_key','U.new_password_requested','U.last_login','U.last_ip','U.created_date','U.modified_date','U.opt_in_email','U.google_id','U.master_country_id','U.image','MC.country_name');
            $query->selectRaw('CONCAT("U"."first_name", \' \',"U"."last_name") as name');
			// Query by country Name
			if(isset($post_data['country']) && $post_data['country'] > -1) {
			  $query->where('U.master_country_id', $post_data['country']);
			}
			// Query by status
			if(isset($post_data['status']) && $post_data['status'] > -1) {
			  $query->where('U.status', $post_data['status']);
			}
			// Query by keyword Name
			if(isset($post_data['keyword']) && $post_data['keyword'] != "") {
				$query->where(function($query) use ($post_data){
	                  $query->where('user_name', 'ilike', '%' . $post_data['keyword'] . '%');
					  $query->orWhere('email', 'ilike', '%' . $post_data['keyword'] . '%');
					  $query->orwhere(DB::raw("concat(first_name,' ',last_name)"), 'ilike', '%'.$post_data['keyword'].'%');
             	});
			}
			$query->leftJoin('users.master_countries as MC','MC.master_country_id','=','U.master_country_id');
			// DB::enableQueryLog();
			// Get All the results
			$tempdb = clone $query;
			$query = $query->get();
			$total = $query->count();
			$sql = $tempdb->orderBy($sort_field, $sort_order)->offset($offset)->limit($limit)
		      ->get();
			$results['result'] = $sql;
			$results['total'] = $total;

			return response()->json(['response_code'=>200,'data'=>$results]);
    	}
    	catch (\Exception $e)
    	{
    		return response()->json(['status'=>'error','error'=>$e->getMessage()]);
    	}
    }
	//this function get only single user detail
    public function get_user_detail(Request $request)
    {
    	$user_unique_id = $request->user_unique_id;
    	$results = User::where('user_unique_id',$user_unique_id)->
    	with(['master_country:master_country_id,country_name','master_state:master_state_id,name as state_name'])->first();

    	return response()->json(['response_code'=>200,'data'=>$results]);
    }
    //this function chnage user name
    public function change_user_name(Request $request)
    {
		$user_unique_id = $request->user_unique_id;
		$editdata = array(
          'user_name' => $request->user_name
        );
    	$results= User::where('user_unique_id', $user_unique_id)->update($editdata);
		$api_response_arry['data'] = $results;
		return response()->json(['response_code'=>200,'results'=>$api_response_arry,'message'=>'username updated susscssfully']);
    }
    //this function chnage user status
    public function change_user_status(Request $request)
    {
		$validator = \Validator::make($request->all(), [
            'user_unique_id' => 'required',
            'user_id' => 'required',
            'status' => 'required',
        ]);
		$user_unique_id = $request->post('user_unique_id');
    	$status = $request->post('status');
	    $add_balance = $request->post('add_balance');
	    $reason = $request->post('reason') ? $request->post('reason') : "";
    	$ban_period = $request->post('ban_period') ? $request->post('ban_period') : "";
	    $ban_revoke_time = null;
		if ($add_balance != '') {
	    	$validator = \Validator::make($request->all(), ['add_balance'=>'required|max:7','reason'=>'required']);
	    }
		if ($status == 3) {
	    	$validator = \Validator::make($request->all(), ['ban_period'=>'required']);
	    }
		if($validator->fails())
		{
			$errors = $validator->errors()->all();
			$message = $errors[array_keys($errors)[0]];
			return response()->json(['message'=>$message],500);
		}
	 	$current_balance =  User::where('user_unique_id', $user_unique_id)->select('balance')->first();
		$insert_balance = ($add_balance) ? $add_balance : 0 ;
	   	$data_arr = array(
	      'user_id' => $request->post('user_id'),
	      'status'    => $status,
	      'status_reason'  => $reason,
	      'balance' => $current_balance['balance'] + $insert_balance
    	);
		$result =  User::where('user_unique_id', $user_unique_id)->update($data_arr);
       // return $data_arr['balance'];
		if($result && $data_arr['balance'] != 0 && $add_balance != '')
	   	{

			$payment_history = array(
		        "user_id" => $data_arr['user_id'],
		        "description" => 'Deposited by admin',
		        "payment_type" => 0,
		        "payment_for" => 0,
		        "amount" => $insert_balance,
		        "created_date" => date("Y-m-d H:i:s"),
		        "is_processed" => 1
		    );
			$this->transaction->make_payment_transaction($payment_history);
		}
	   	 return response()->json(['response_code'=>200,'results'=>$result,'message'=>'status updated susscssfully']);
    }

    public function export_pdf(Request $request)
    {
        $users = User::all();
        //return view('user/user_pdf', compact('users'));
        $pdf = PDF::loadView('user/user_pdf', compact('users'));
       return $pdf->download('users_list.pdf');
    }

    public function export_excel(Request $request)
    {
            try {
                ob_end_clean();
                ob_start();
                return Excel::download(new UsersExport, 'users_list.xlsx');
            } catch (Exception $e) {

            }
    }
	//this function get user portfolio
    // public function get_user_portfolio_detail(Request $request)
    // {
    // 	$post_data = $request->all();
    // 	$user_id =   $post_data['user_id'];
    // 	if($user_id)
    //     {
    //         $sort_field = 'UP.created_date';
    //         $sort_order = 'DESC';
    //         $limit = 20;
    //         $page = 0;
    //         $post_data = $request->all();
    //         if ($post_data['items_perpage'] && $post_data['items_perpage'] != 0) {
    //           $limit = $post_data['items_perpage'];
    //         }
    //         if ($post_data['current_page'] && $post_data['current_page'] != 0) {
    //           $page = $post_data['current_page'] - 1;
    //         }
    //         if (isset($post_data['sort_order']) && in_array($post_data['sort_order'], array('DESC', 'ASC'))) {
    //           $sort_order = $post_data['sort_order'];
    //         }
    //         $offset = $limit * $page;
    //         // Start the query
    //         $query = DB::table('game.user_portfolio as UP');
    //         $query->select('UP.shares_owns as share','UP.created_date','P.full_name as player_name','T.team_name','P.current_buy_rate as buy_rate','P.current_sell_rate as sell_rate',
    //             DB::raw('(CASE
    //                     WHEN "P"."current_sell_rate" > "P"."current_buy_rate" THEN "P"."current_sell_rate" - "P"."current_buy_rate"
    //                     WHEN "P"."current_sell_rate" < "P"."current_buy_rate" THEN "P"."current_sell_rate" - "P"."current_buy_rate"
    //                     ELSE 0
    //                     END) AS profit_loss'),DB::raw('("UP"."shares_owns" * "P"."current_buy_rate") as cost'));
    //         $query->Join('game.players as P', 'P.player_id', '=', 'UP.player_id');
    //         $query->Join('game.player_teams as PT','PT.player_id', '=', 'P.player_id');
    //         $query->Join('game.teams as T', 'T.team_id', '=', 'PT.team_id');
    //         // $query->Join('game.players_trades as PTR', 'PTR.player_id', '=', 'UP.player_id');
    //         if(isset($post_data['keyword']) && $post_data['keyword'] != "") {
    //             $query->where(function($query) use ($post_data){
    //                 $query->where('P.full_name', 'ilike', '%' . $post_data['keyword'] . '%');
    //                 $query->orWhere('T.team_name', 'ilike', '%' . $post_data['keyword'] . '%');
    //             });
    //         }
    //         //$query->groupBy('UP.user_id');
    //         $query->where('UP.user_id', $user_id);
    //         $tempdb = clone $query;
    //         $query = $query->get();
    //         $total = $query->count();
    //         $sql = $tempdb->orderBy($sort_field, $sort_order)->offset($offset)->limit($limit)
    //           ->get();
    //         $results['results'] = $sql;
    //         $results['total'] = $total;
    //         return response()->json(['response_code'=>200,'data'=>$results,'service_name'=>'get_user_portfolio']);
    //     }
    //     else
    //     {
    //         return response()->json(['response_code'=>500,'service_name'=>'get_user_portfolio','message'=>'Something Went Wrong']);
    //     }


    // }
	//this function get user watchlist
    // public function get_user_watchlist(Request $request)
    // {
    // 	$post_data = $request->all();
    // 	$user_id =   $post_data['user_id'];
    // 	if($user_id)
    //     {
    //         $sort_field = 'UW.created_date';
    //         $sort_order = 'DESC';
    //         $limit = 2;
    //         $page = 0;
    //         $post_data = $request->all();
    //         if ($post_data['items_perpage'] && $post_data['items_perpage'] != 0) {
    //           $limit = $post_data['items_perpage'];
    //         }
    //         if ($post_data['current_page'] && $post_data['current_page'] != 0) {
    //           $page = $post_data['current_page'] - 1;
    //         }
    //         if (isset($post_data['sort_order']) && in_array($post_data['sort_order'], array('DESC', 'ASC'))) {
    //           $sort_order = $post_data['sort_order'];
    //         }
    //         $offset = $limit * $page;
    //         // Start the query
    //         $query = DB::table('game.user_watchlist as UW');
    //         $query->select('UW.created_date as date_added','P.full_name as player_name','T.team_name','P.current_buy_rate as buy_rate','P.current_sell_rate as sell_rate');
    //         $query->Join('game.players as P', 'P.player_id', '=', 'UW.player_id');
    //         $query->Join('game.player_teams as PT','PT.player_id', '=', 'P.player_id');
    //         $query->Join('game.teams as T', 'T.team_id', '=', 'PT.team_id');
    //         // $query->leftJoin('game.players_trades as PTR', 'PTR.player_id', '=', 'UW.player_id');
    //         if(isset($post_data['keyword']) && $post_data['keyword'] != "") {
    //             $query->where(function($query) use ($post_data){
    //                 $query->where('P.full_name', 'ilike', '%' . $post_data['keyword'] . '%');
    //                 $query->orWhere('T.team_name', 'ilike', '%' . $post_data['keyword'] . '%');
    //             });
    //         }
    //         //$query->groupBy('UW.user_id');
    //         $query->where('UW.user_id', $user_id);
    //         $tempdb = clone $query;
    //         $query = $query->get();
    //         $total = $query->count();
    //         $sql = $tempdb->orderBy($sort_field, $sort_order)->offset($offset)->limit($limit)
    //           ->get();
    //         $results['results'] = $sql;
    //         $results['total'] = $total;
    //         return response()->json(['response_code'=>200,'data'=>$results,'service_name'=>'get_user_watchlist']);

    //     }
    //     else
    //     {
    //         return response()->json(['response_code'=>500,'service_name'=>'get_user_watchlist','message'=>'Something Went Wrong']);
    //     }


  //   	$sort_field = 'UW.created_date';
	 //    $sort_order = 'DESC';
	 //    $limit = 10;
	 //    $page = 0;
	 //    $post_data = $request->all();
		// try
	 //    {
		// 	if ($post_data['items_perpage'] && $post_data['items_perpage'] != 0) {
		//       $limit = $post_data['items_perpage'];
		//     }
		//     if ($post_data['current_page'] && $post_data['current_page'] != 0) {
		//       $page = $post_data['current_page'] - 1;
		//     }
		// 	if (isset($post_data['sort_order']) && in_array($post_data['sort_order'], array('DESC', 'ASC'))) {
		//       $sort_order = $post_data['sort_order'];
		//     }
		// 	$offset = $limit * $page;
		// 	// Start the query
		// 	$query = DB::table('game.user_watchlist as UW');
		// 	$query->select('UW.*','P.full_name');
		// 	// Query by status
		// 	if(isset($post_data['user_id']) && $post_data['user_id']) {
		// 	  $query->where('user_id', $post_data['user_id']);
		// 	}
		// 	$query->Join('game.players as P','P.player_id','=','UW.player_id');
		// 	$tempdb = clone $query;
		// 	$query = $query->get();
		// 	$total = $query->count();
		// 	$sql = $tempdb->orderBy($sort_field, $sort_order)->offset($offset)->limit($limit)
		//       ->get();
		// 	$results['results'] = $sql;
		// 	$results['total'] = $total;
		// 	return response()->json(['response_code'=>200,'data'=>$results]);
	 //    }
	 //    catch (\Exception $e)
  //   	{
  //   		return response()->json(['status'=>'error','error'=>$e->getMessage()]);
  //   	}
    // }
}
