<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\RedPacket;
use Auth;
use DB;
use Validator;

class RedPacketController extends Controller
{
    /**
     * Display a listing of the Red Packet
     *
     */
    public function index(Request $request)
    {
        $packet = new RedPacket;
        $packet = $packet->orderBy('red_packet_id','ASC');
        $packet = $packet->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'red_packet_list','data' => $packet],200);
    }

    /**
     * Show the form for creating a Red Packect.
     *
     */
    public function create(Request $request)
    {
        $min             = $request->post('min');
        $max             = $request->post('max');
        $drop_min_amount = $request->post('drop_min_amount');
        $drop_max_amount = $request->post('drop_max_amount');
        $drop_rates      = $request->post('drop_rates');
        $games           = $request->post('games');

        //validation

        $validator = Validator::make($request->all(), [
            'min' => 'required',
            'max' => 'required',
            'drop_min_amount' => 'required',
            'drop_max_amount' => 'required',
            'drop_rates'      => 'required'
        ]);


        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'create_red_packet',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }
        
        RedPacket::create([
            "min"            => $min,
            "max"            => $max,
            "drop_min_amount"=> $drop_min_amount,
            "drop_max_amount"=> $drop_max_amount,
            "drop_rates"     => $drop_rates,
            "games"          => json_encode($games),
            "status"         => 0,
            "created_at"     => date('Y-m-d H:i:s'),
            "updated_at"     => date('Y-m-d H:i:s')
        ]);

        return response()->json([
            'response_code'=> 200,
            'service_name' => 'create_red_packet',
            'message'=> 'Red Packet Created Successfully',
        ],200);
    }
}
