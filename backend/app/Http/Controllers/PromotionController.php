<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Promotion;
use App\Models\Player;
use File;
use DB;
use Validator;

class PromotionController extends Controller
{
    public function list(Request $request)
    {
        \DB::enableQueryLog();
        $all_promotion = new Promotion;
        // Partial Keyword Search Filter with player name
        if($request->keyword != "" )
        {
            $all_promotion = $all_promotion->where('name','ilike', '%'.$request->keyword.'%');
        }
        $all_promotion = $all_promotion->orderBy('name','DESC');
        $all_promotion = $all_promotion->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'promotion_list','data' => $all_promotion]);
    }

    public function create_promotion( Request $request ){
      $promotionDetails = $request->post('promotion_details');
      //validation
      $validator = Validator::make($promotionDetails, [
        "name" => ['required'],
      ]);

      if($validator->fails()){
        return response()->json([
          'response_code'=> 400,
          'service_name' => 'create_promotion',
          'message'=> 'Validation Failed',
          'global_error'=> $validator->errors()->first(),
        ], 400);
      }

      $newEvent = Promotion::create([
        "name" => $promotionDetails['name'],
      ]);
      
      return response()->json([
        'response_code'=> 200,
        'service_name' => 'create',
        'message'=> 'Promotion Created Successfully',
      ]);
    }

    public function update( Request $request ){

        $promotionDetails = $request->post();
        // FUTURE TODOs: Many validations pending need to be completed in future
        $validator = Validator::make($promotionDetails, [
          "name" => ['required'],
          "id" => ['required']
        ]);
  
        if($validator->fails()){
          return response()->json([
            'response_code'=> 400,
            'service_name' => 'update_promotion',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
          ], 400);
        }
  
        $newEvent = Promotion::where('id',$promotionDetails['id'])->update([
          "name" => $promotionDetails['name'],
        ]);
        return response()->json([
          'response_code'=> 200,
          'service_name' => 'create',
          'message'=> 'promotion Updated Successfully',
        ]);
      }

    public function delete_promotion(Request $request)
	  {
      $promotion_id = $request->post('promotion_id');
      $fighter_res = Player::where('promotion_id',$promotion_id)->first();
      if (!empty($fighter_res)) {
         return response()->json(['message'=>'Permission denied. promotion exist in fighter list'],500);
      }else {
        $res = Promotion::find($promotion_id)->delete();
        return response()->json(['results'=>$res,'message'=>'Promotion deleted Successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
      }
    }
}