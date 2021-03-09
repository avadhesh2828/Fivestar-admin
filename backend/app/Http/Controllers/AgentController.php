<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Agent;
use App\Models\AdminRoles;
use App\Models\PaymentDepositTransaction;
use App\Models\History;
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
        if($request->parent_id != ''){
            $agent = $agent->where('parent_id', $request->parent_id);
        } else {
            $agent = $agent->where('parent_id', $user_id);
        }
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

        $maxBalance = ($this->user->role_id == 1) ? '':'|max:'.$this->user->balance; 
        //validation
        $customMessages = [
            'password.regex' => 'Password must have one uppercase and must be alphanumeric.',
        ];

        $validator = Validator::make($request->all(), [
            'username' => 'required|unique:pgsql.users.admins,username|min:7|max:16',
            'password' => 'required|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'score'    => 'required|numeric|min:0'.$maxBalance,
            'name'     => 'required'
        ],$customMessages);


        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'create_agent',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $roles = AdminRoles::where('name', 'AGENT')->first();
        
        Agent::create([
            "username"      => $username,
            "password"      => Hash::make($password),
            "balance"       => 0, //$score,
            "name"          => $name,
            "phone"         => $phone,
            "description"   => $description,
            "role_id"       => $roles->role_id,
            "status"        => 1,
            "parent_id"     => $user_id,
            "unique_code"   => random_string('alnum', 9),
            "created_at"    => date('Y-m-d H:i:s'),
            "updated_at"    => date('Y-m-d H:i:s')
        ]);

        $InsertAgentId = DB::getPdo()->lastInsertId();
        History::create(['action_for' => 3, 'to_id' => $InsertAgentId, 'from_id' => $user_id, 'name' => $username, 'description' => 'Agent created successfully', 'last_ip' => \Request::ip(), 'type' => '0', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);    

        if($score > 0) {
            $this->addBalance($this->user, $InsertAgentId, $score); 
        }

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

    /**
     * Get Agent Details.
     *
     */
    public function get_agent_details($agentId) {
        $agent = new Agent;
        $agent = $agent->where('admin_id', $agentId);
        $agent = $agent->first();

        return response()->json(['response_code'=> 200,'service_name' => 'get_agent_details', 'message' => 'Agent details', 'data' => $agent ],200);  
    }


    /**
     * update agent details.
     *
     */
    public function update_agent(Request $request)
    {

        $this->user = Auth::user();
        $admin_id         = $this->user->admin_id;
        $agent_id         = $request->post('agent_id');
        $name             = $request->post('name');
        $score            = $request->post('score');
        $phone            = $request->post('phone');
        $new_password     = $request->post('new_password');
        $confirm_password = $request->post('confirm_password');
        $description      = $request->post('description');

        $maxBalance = ($this->user->role_id == 1) ? '':'|max:'.$this->user->balance; 
        //validation
        $validator = Validator::make($request->all(), [
            'agent_id'         => 'required',
            'score'            => 'nullable|numeric|min:0'.$maxBalance,
            'phone'            => 'nullable|numeric|min:1|max:10',
            'new_password'     => 'nullable|min:6',
            'confirm_password' => 'nullable|required_with:new_password|same:new_password|min:6'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'update_agent',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $agent_data = Agent::where('admin_id', $agent_id)->first();  
        if($score > 0) {
            $data = array(
                "name"        => $name,
                "balance"     => $agent_data->balance + $score, 
                "phone"       => $phone, 
                "description" => $description,
                "updated_at"  => date('Y-m-d H:i:s')
            );
            $this->scoreHistory($agent_data, $score);
            if($this->user->role_id == 2) {
                Agent::where('admin_id', $admin_id)->decrement('balance', $score); 
            }
        } else {
            $data = array(
                "name"        => $name,
                "phone"       => $phone, 
                "description" => $description,
                "updated_at"  => date('Y-m-d H:i:s')
            );
        }     

        $update = Agent::where('admin_id', $agent_id)->update($data);    
        if($update > 0) {
            if(isset($new_password)) {
                Agent::where('admin_id', $agent_id)->update(['password' => Hash::make($new_password)]);
            }
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'update_agent',
                'message'=> 'Agent updated Successfully',
            ],200);
        } else {
            return response()->json([
                'response_code'=> 500,
                'service_name' => 'update_agent',
                'message'=> 'Something wrong for updating agent details',
            ],500);
        }
        
    }

    /**
     * Save deposit score history.
     *
     */
    private function scoreHistory($user, $score) {
        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;
        PaymentDepositTransaction::insert([
            'user_id'      => $user->admin_id,
            'admin_id'     => $admin_id,
            'set_score'    => $score,
            'before_score' => $user->balance,
            'after_score'  => $user->balance + $score,
            'ip'           => \Request::ip(),
            'type'         => 'agent',
            'date_created' => date('Y-m-d H:i:s'),
            'date_modified'=> date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Set User Score.
     *
     */
    public function set_score(Request $request) {

        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;

        $agent_id = $request->post('agent_id');
        $score = $request->post('score');
        //validation
        $validator = Validator::make($request->all(), [
            "agent_id" => 'required',
            "score" => 'required|numeric'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'set_score',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $checkAgent = Agent::where('admin_id', $agent_id)->first();
        if($checkAgent) {
            $updateBalance = Agent::where('admin_id', $checkAgent->admin_id)->update(['balance' => $checkAgent->balance + $score]);
            if($this->user->role_id == 2) {
                Agent::where('admin_id', $admin_id)->decrement('balance', $score); 
            }

            PaymentDepositTransaction::insert([
                'user_id'      => $checkAgent->admin_id,
                'admin_id'     => $admin_id,
                'set_score'    => $score,
                'before_score' => $checkAgent->balance,
                'after_score'  => $checkAgent->balance + $score,
                'ip'           => \Request::ip(),
                'type'         => 'agent',
                'date_created' => date('Y-m-d H:i:s'),
                'date_modified'=> date('Y-m-d H:i:s')
            ]);

            History::create(['action_for' => 0, 'to_id' => $checkAgent->admin_id, 'from_id' => $admin_id, 'name' => $checkAgent->username, 'description' => 'Score set successfully', 'last_ip' => \Request::ip(), 'type' => 0, 'set_score' => $score, 'before_score' => $checkAgent->balance, 'after_score'  => $checkAgent->balance + $score, 'payment_type' => 0 ,'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);

            return response()->json([
                'response_code'=> 200,
                'service_name' => 'set_score', 
                'message' => 'Score set successfuly', 
                'data' => $checkAgent 
            ],200);

        } else {
        
            return response()->json([
                'response_code'=> 500,
                'service_name' => 'set_score',
                'message'=> "Agent does't exist",
                'global_error'=> "Agent does't exist"
            ],500);
        }     

    }    


    private function addBalance($admin, $agentId, $score)
    {
        $checkAgent = Agent::where('admin_id', $agentId)->first();
        if($checkAgent) {
            $updateBalance = Agent::where('admin_id', $checkAgent->admin_id)->update(['balance' => $checkAgent->balance + $score]);
            if($admin->role_id == 2) {
                Agent::where('admin_id', $admin->admin_id)->decrement('balance', $score); 
            }

            PaymentDepositTransaction::insert([
                'user_id'      => $checkAgent->admin_id,
                'admin_id'     => $admin->admin_id,
                'set_score'    => $score,
                'before_score' => $checkAgent->balance,
                'after_score'  => $checkAgent->balance + $score,
                'ip'           => \Request::ip(),
                'type'         => 'agent',
                'date_created' => date('Y-m-d H:i:s'),
                'date_modified'=> date('Y-m-d H:i:s')
            ]);

            History::create(['action_for' => 0, 'to_id' => $checkAgent->admin_id, 'from_id' => $admin->admin_id, 'name' => $checkAgent->username, 'description' => 'Score set successfully', 'last_ip' => \Request::ip(), 'type' => 0, 'set_score' => $score, 'before_score' => $checkAgent->balance, 'after_score'  => $checkAgent->balance + $score, 'payment_type' => 0 ,'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);
        
            return;
        }    
    }



}
