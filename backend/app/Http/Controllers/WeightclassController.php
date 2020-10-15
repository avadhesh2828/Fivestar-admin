<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\WeightClasses;
use App\Models\Match;
use File;
use DB;
use Validator;

class WeightclassController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        \DB::enableQueryLog();
        $weightclass = new WeightClasses;
        // Partial Keyword Search Filter with player name
        if($request->keyword != "" )
        {
            $weightclass = $weightclass->where('weight_class_name','ilike', '%'.$request->keyword.'%');
        }
        $weightclass = $weightclass->orderBy('weight_class_name','ASC');
        $weightclass = $weightclass->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'weightclass_list','data' => $weightclass]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
      $weightclassDetails = $request->post('weightclass_details');
      //validation
      $validator = Validator::make($weightclassDetails, [
        "weight_class_name" => ['required'],
        "min_weight" => ['required'],
        "max_weight" => ['required']
      ]);

      if($validator->fails()){
        return response()->json([
          'response_code'=> 400,
          'service_name' => 'create_weightclass',
          'message'=> 'Validation Failed',
          'global_error'=> $validator->errors()->first(),
        ], 400);
      }

      $newWeightClasses = WeightClasses::create([
        "weight_class_name" => $weightclassDetails['weight_class_name'],
        "min_weight" => $weightclassDetails['min_weight'],
        "max_weight" => $weightclassDetails['max_weight'],
        "discipline" =>1
      ]);
      
      return response()->json([
        'response_code'=> 200,
        'service_name' => 'create',
        'message'=> 'Weight class Created Successfully',
      ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $weightclassDetails = $request->post();
        //print_r($weightclassDetails); die;
        // FUTURE TODOs: Many validations pending need to be completed in future
        $validator = Validator::make($weightclassDetails, [
          "weight_class_id" => ['required'],
          "weight_class_name" => ['required'],
          "min_weight" => ['required'],
          "max_weight" => ['required']
        ]);
  
        if($validator->fails()){
          return response()->json([
            'response_code'=> 400,
            'service_name' => 'update_promotion',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
          ], 400);
        }
  
        $newWeightClasses = WeightClasses::where('weight_class_id',$weightclassDetails['weight_class_id'])->update([
          "weight_class_name" => $weightclassDetails['weight_class_name'],
          "min_weight" => $weightclassDetails['min_weight'],
          "max_weight" => $weightclassDetails['max_weight'],
          "discipline" =>1
        ]);
        return response()->json([
          'response_code'=> 200,
          'service_name' => 'create',
          'message'=> 'Weight class Updated Successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
      $weight_class_id = $request->post('weight_class_id');
      $player_res = Match::where('weight_class_id',$weight_class_id)->first();
      if (!empty($player_res)) {
        return response()->json(['message'=>'Permission denied. Weight class exist in match list'],500);
      }else {
        $res = WeightClasses::find($weight_class_id)->delete();
        return response()->json(['results'=>$res,'message'=>'Weight class deleted Successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
      }
    }
}
