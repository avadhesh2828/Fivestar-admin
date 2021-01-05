<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Jackpot;
use Auth;
use DB;
use Validator;

class JackpotController extends Controller
{
    /**
     * Display a listing of the Jackpot
     *
     */
    public function index(Request $request)
    {
        $jeckpot = new Jackpot;
        $jeckpot = $jeckpot->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'jackpot_list','data' => $jeckpot],200);
    }


    /**
     * update red jackpot details.
     *
     */
    public function update(Request $request)
    {
        $id            = $request->post('id');
        $jackpot_value = $request->post('jackpot_value');
        $reset_value   = $request->post('reset_value');
        //validation
        $validator = Validator::make($request->all(), [
            "id"            => 'required',
            "jackpot_value" => 'required',
            "reset_value"   => 'required'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'update',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }
        $update = Jackpot::where('id', $id)->update(['jackpot_value' => $jackpot_value, 'reset_value' => $reset_value, 'updated_at'  => date('Y-m-d H:i:s')]);
        if($update > 0){
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'update',
                'message'=> 'Jackpot detail updated Successfully',
            ],200);
        }else{
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'update',
                'message'=> 'Someting wrong for updating jackpot',
            ],500);
        }
    }

}