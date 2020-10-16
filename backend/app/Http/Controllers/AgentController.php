<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Agent;
use Auth;
use DB;
use Validator;
use Illuminate\Support\Facades\Hash;


class AgentController extends Controller
{
    /**
     * Display a listing of the agent.
     *
     */
    public function index(Request $request)
    {
        $this->user = Auth::user();
        $user_id = $this->user->admin_id;
    
        $agent = new Agent;
        $agent = $agent->where('parent_id', $user_id);
        $agent = $agent->orderBy('admin_id','ASC');
        $agent = $agent->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'agent_list','data' => $agent],200);
    }

    /**
     * Show the form for creating a new resource.
     *
     */
    public function create(Request $request)
    {   
        $this->user = Auth::user();
        $user_id = $this->user->admin_id;

        $username = $request->post('username');
        $password = $request->post('password');
        $score    = $request->post('score');
        $name     = $request->post('name');
        $phone    = $request->post('phone');
        $description = $request->post('description');
        //validation
        $validator = Validator::make($request->all(), [
            "username" => ['required'],
            "password" => ['required'],
            "score"    => ['required'],
            "name"     => ['required'],
            "phone"    => ['required']
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'create_agent',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        Agent::create([
            "username"      => $username,
            "password"      => Hash::make($password),
            "balance"       => $score,
            "name"          => $name,
            "phone"         => $phone,
            "description"   => $description,
            "role_id"       => 2,
            "status"        => 1,
            "parent_id"     => $user_id,
            "last_login"    => date('Y-m-d H:i:s'),
            "last_ip"       => '127.0.0.1'
        ]);
        
        return response()->json([
            'response_code'=> 200,
            'service_name' => 'create_agent',
            'message'=> 'Agents Created Successfully',
        ],200);
    }

    /**
     * Change agent status.
     *
     */
    public function change_agent_status($agent_id, Request $request)
    {   
        $this->user = Auth::user();
        $user_id = $this->user->admin_id;

        $status = $request->post('status');
        //validation
        $validator = Validator::make($request->all(), [
            "status" => ['required']
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'change_agent_status',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $update = Agent::where('admin_id', $agent_id)->where('parent_id', $user_id)->update(["status" => $status, "updated_date"  => date('Y-m-d H:i:s')]);
        if($update > 0){
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_agent_status',
                'message'=> 'Agent status changed Successfully',
            ],200);
        }else{
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_agent_status',
                'message'=> 'Someting wrong for updating agent status',
            ],500);
        }
        
        
    }

}
