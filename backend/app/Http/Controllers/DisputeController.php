<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Dispute_model;
use DB;

class DisputeController extends Controller
{
	public function get_all_disputes(Request $request)
  {
    $all_disputes = new Dispute_model;
    $all_disputes = $all_disputes->select('dispute_id','contest_id','user_id','dispute_message');
    $all_disputes =$all_disputes->selectRaw('CAST("status" as CHAR)');
    $all_disputes = $all_disputes->with('users','contest');
    if (isset($request->status) && $request->status > -1) {
		    $all_disputes =	$all_disputes->where('status', $request->status);
		}
		 // Partial Keyword Search Filter (Relationship) Filter
    $all_disputes = $all_disputes->whereHas('users', function($q) use ($request){
      if( $request->keyword != "" ){
        $q->where('email', 'LIKE', '%'.$request->keyword.'%')
        ->orWhereRaw('LOWER(user_name) LIKE \'%'.$request->keyword.'%\'');
      }
    });

    $all_disputes = $all_disputes->get();
    return response()->json(['response_code'=>200,'service_name'=>'get_all_disputes','data'=>$all_disputes]);
  }

  //post method[chnage_dispute_status]
  public function change_dispute_status(Request $request)
  {
  	$post = $request->post();
  	$dispute_id = $post['dispute_id'];
  	$result = Dispute_model::where('dispute_id', $dispute_id)->update(array('status' => $post['status']));
  	if($result)
  	{
  		return response()->json(['response_code'=>200,'service_name'=>'chnage_dispute_status','data'=>$result,'message' => 'Status updated successfully.']);
  	}
  	else
  	{
  		return response()->json(['response_code'=>500,'message' => 'Some Problem updating dispute status.']);
  	}
  }

  //post method[dispute single detail]
  public function get_dispute_detail(Request $request)
  {
  	$dispute_id = $request->post('dispute_id');
  	$dispute_detail = new Dispute_model;
    $dispute_detail = $dispute_detail->with('users','contest');
    $dispute_detail = $dispute_detail->where('dispute_id',$dispute_id);
    $dispute_detail = $dispute_detail->first();
    return response()->json(['response_code'=>200,'service_name'=>'get_dispute_detail','data'=>$dispute_detail]);
  }
}
