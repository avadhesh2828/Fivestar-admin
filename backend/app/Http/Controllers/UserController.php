<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\User;
use App\Models\LoginHistory;
use App\Models\Agent;
use App\Models\User_Portfolio;
use App\Models\User_Watchlist;
use App\Http\Controllers\Payment_transaction;
use App\Models\PaymentDepositTransaction;
use App\Models\PaymentHistoryTransaction;
use App\Models\History;
use App\Exports\UsersExport;
use Excel;
use PDF;
use App;
use Auth;
use DB;
use Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;


class UserController extends Controller
{
    /**
     * Display a listing of the Users.
     *
     */
    public function index(Request $request)
    {
        $this->user = Auth::user();
        $user_id = $this->user->admin_id;

        $users = new User;
        if($request->parent_id != ''){
            $users = $users->where('parent_id', $request->parent_id);
        } else {
            $users = $users->where('parent_id', $user_id);
        }
        if($request->status != '') {
            $users = $users->where('status', $request->status);
        } 
        $users = $users->orderBy('user_id','ASC');
        $users = $users->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'users_list','data' => $users],200);
    }


    /**
     * Show the form for creating a user.
     *
     */
    public function create(Request $request)
    {
        $this->user = Auth::user();
        $agent_id = $this->user->admin_id;

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
            'username' => 'required|numeric|unique:pgsql.users.user,username',
            'password' => 'required|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'score'    => 'required|numeric|min:0'.$maxBalance,
            'name'     => 'required'
        ],$customMessages);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'create_user',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        User::create([
            "username"      => $username, //mt_rand(1111111111, 9999999999),
            "password"      => Hash::make($password),
            "balance"       => 0, //$score,
            "name"          => $name,
            "phone"         => $phone,
            "description"   => $description,
            "status"        => 1,
            "parent_id"     => $agent_id,
            "user_unique_id"=> random_string('alnum', 9),
            "created_at"    => date('Y-m-d H:i:s'),
            "updated_at"    => date('Y-m-d H:i:s')
        ]);

        $InsertplayerId = DB::getPdo()->lastInsertId();
        History::create(['action_for' => 4, 'to_id' => $InsertplayerId, 'from_id' => $agent_id, 'name' => $username, 'description' => 'Player created successfully', 'last_ip' => \Request::ip(), 'type' => '1', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);

        if($score > 0) {
            $this->addBalance($this->user, $InsertplayerId, $score);
        }

        return response()->json([
            'response_code'=> 200,
            'service_name' => 'create_user',
            'message'=> 'User created Successfully',
        ],200);
    }


    /**
     * Change user status.
     *
     */
    public function change_user_status($user_id, Request $request)
    {
        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;

        $status = $request->post('status');
        //validation
        $validator = Validator::make($request->all(), [
            "status" => ['required']
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'change_user_status',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $update = User::where('user_id', $user_id)->where('parent_id', $admin_id)->update(["status" => $status, "updated_at"  => date('Y-m-d H:i:s')]);
        if($update > 0){
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_user_status',
                'message'=> 'User status changed Successfully',
            ],200);
        }else{
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'change_user_status',
                'message'=> 'Someting wrong for updating user status',
            ],500);
        }
    }

    /**
     * Player Login History.
     *
     */
    public function get_login_history(Request $request) {
        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;

        $username = $request->post('username');
        //validation
        $validator = Validator::make($request->all(), [
            "username" => 'required|numeric'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'get_login_history',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $checkPlayer = User::where('username', $username);
        // if($this->user->role_id != 1){
        //     $checkPlayer = $checkPlayer->where('parent_id', $this->user->parent_id);
        // }
        $checkPlayer = $checkPlayer->first();
        if($checkPlayer) {
            $playerIp = new LoginHistory;
            $playerIp = $playerIp->select('user_login_history.*', 'U.username');
            $playerIp = $playerIp->join('users.user as U', function($q) {
                $q->on('U.user_id', '=', 'user_login_history.user_id');
            });
            if($this->user->role_id != 1){    
                $playerIp = $playerIp->where('U.parent_id', $admin_id);
            }    
            $playerIp = $playerIp->where('U.username', $username);
            $playerIp = $playerIp->orderBy('user_login_history.created_at', 'DESC');
            $playerIp = $playerIp->limit(10);
            $playerIp = $playerIp->get();

            return response()->json(['response_code'=> 200,'service_name' => 'get_login_history','data' => $playerIp],200);
        } else {
            return response()->json(['response_code'=> 500,'service_name' => 'get_login_history','message'=> "Username does't exist",
            'global_error'=> "Username does't exist"],500);
        }
        echo json_encode($checkPlayer);die;

    }


    /**
     * Search User.
     *
     */
    public function search_user(Request $request) {
        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;

        $username = $request->post('username');
        //validation
        $validator = Validator::make($request->all(), [
            "username" => 'required|numeric'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'search_user',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $checkPlayer = User::where('username', $username);
        $checkPlayer = $checkPlayer->first();
        if($checkPlayer) {
            $agentIds = $this->getAllParentAgent($this->user->admin_id);

            $user = new User;
            $user = $user->select('user.*', 'A.username as agent_name');
            $user = $user->join('users.admins as A', function($q) {
                $q->on('A.admin_id', '=', 'user.parent_id');
            });
            $user = $user->whereIn('user.parent_id', $agentIds);
            $user = $user->where('user.username', $username);
            $user = $user->get();

            if(count($user) > 0) {
                return response()->json(['response_code'=> 200,'service_name' => 'search_user','data' => $user],200);
            } else {
                return response()->json(['response_code'=> 500,'service_name' => 'search_user','message'=> "Username not found", 'global_error'=> "Username not found", 'data' => []],500);
            }
            
        } else {
            return response()->json(['response_code'=> 500,'service_name' => 'search_user','message'=> "Username does't exist",
            'global_error'=> "Username does't exist"],500);
        }      

    }


    private function getOneLevel($parentId){
        $agentIds = Agent::select('admin_id','parent_id')->where('parent_id', $parentId)->get();
        $agent_id=array();
        if(count($agentIds)>0){
            foreach($agentIds as $key) {
              $agent_id[]=$key->admin_id; 
            }
        }   
        return $agent_id;
    }
    
    private function getAllParentAgent($parent_id) 
    {
        $tree_string=array($parent_id);
        $tree = array();
        // getOneLevel() returns a one-dimensional array of child ids        
        $tree = $this->getOneLevel($parent_id);     
        if(count($tree)>0 && is_array($tree)){    
            $tree_string=array_merge($tree_string,$tree);
        }
        foreach ($tree as $key => $val) {
            $tree = $this->getOneLevel($val);
            $tree_string=array_merge($tree_string,$tree);
        }
        return $tree_string;
    }

    /**
     * Get User Details.
     *
     */
    public function get_user_details($userId) {
        $user = new User;
        $user = $user->select('user.*', 'A.username AS agent_username');
        $user = $user->join('users.admins as A', function($q) {
            $q->on('A.admin_id', '=', 'user.parent_id');
        });
        $user = $user->where('user_id', $userId);
        $user = $user->first();

        return response()->json(['response_code'=> 200,'service_name' => 'get_user_details', 'message' => 'User details', 'data' => $user ],200);  
    }

    /**
     * Set User Score.
     *
     */
    public function set_score(Request $request) {

        $this->user = Auth::user();
        $admin_id = $this->user->admin_id;

        $player_id = $request->post('player_id');
        $score = $request->post('score');
        //validation
        $validator = Validator::make($request->all(), [
            "player_id" => 'required',
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

        $checkPlayer = User::where('user_id', $player_id)->first();
        if($checkPlayer) {
            $updateBalance = User::where('user_id', $checkPlayer->user_id)->update(['balance' => $checkPlayer->balance + $score]);
            if($this->user->role_id == 2) {
                Agent::where('admin_id', $admin_id)->decrement('balance', $score); 
            }

            PaymentDepositTransaction::insert([
                'user_id'      => $checkPlayer->user_id,
                'admin_id'     => $admin_id,
                'set_score'    => $score,
                'before_score' => $checkPlayer->balance,
                'after_score'  => $checkPlayer->balance + $score,
                'ip'           => \Request::ip(),
                'type'         => 'player',
                'date_created' => date('Y-m-d H:i:s'),
                'date_modified'=> date('Y-m-d H:i:s')
            ]);

            PaymentHistoryTransaction::insert([
                'user_id'       => $checkPlayer->user_id,
                'ip'            => \Request::ip(),
                'action'        => 'SetScore',
                'win'           => $score,
                'begin_money'   => 0,
                'end_money'     => 0,
                'is_redpacket_calculated' => 1,
                'created_at'    => date('Y-m-d H:i:s'),
                'updated_at'    => date('Y-m-d H:i:s')
            ]);

            History::create(['action_for' => 0, 'to_id' => $checkPlayer->user_id, 'from_id' => $admin_id, 'name' => $checkPlayer->username, 'description' => 'Score set successfully', 'last_ip' => \Request::ip(), 'type' => 1, 'set_score' => $score, 'before_score' => $checkPlayer->balance, 'after_score'  => $checkPlayer->balance + $score, 'payment_type' => 0, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);

            return response()->json([
                'response_code'=> 200,
                'service_name' => 'set_score', 
                'message' => 'Score set successfuly', 
                'data' => $checkPlayer 
            ],200);

        } else {
        
            return response()->json([
                'response_code'=> 500,
                'service_name' => 'set_score',
                'message'=> "Username does't exist",
                'global_error'=> "Username does't exist"
            ],500);
        }     

    }

    /**
     * update user details.
     *
     */
    public function update_user(Request $request)
    {
        $this->user = Auth::user();
        $agent_id  = $this->user->admin_id;
        $user_id   = $request->post('user_id');
        $name      = $request->post('name');
        $score     = $request->post('score');
        $phone     = $request->post('phone');
        $new_password     = $request->post('new_password');
        $confirm_password = $request->post('confirm_password');
        $description = $request->post('description');

        $maxBalance = ($this->user->role_id == 1) ? '':'|max:'.$this->user->balance; 
        //validation
        $validator = Validator::make($request->all(), [
            'user_id'          => 'required',
            'score'            => 'nullable|numeric|min:0'.$maxBalance,
            'phone'            => 'nullable|numeric|min:1|max:10',
            'new_password'     => 'nullable|min:6',
            'confirm_password' => 'nullable|required_with:new_password|same:new_password|min:6'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'update_user',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $user_data = User::where('user_id', $user_id)->first();  
        if($score > 0) {
            $data = array(
                "name"       => $name,
                "balance"    => $user_data->balance + $score, 
                "phone"      => $phone, 
                "description"=> $description,
                "updated_at" => date('Y-m-d H:i:s')
            );
            if($this->user->role_id == 2) {
                Agent::where('admin_id', $agent_id)->decrement('balance', $score);
            }
            $this->scoreHistory($user_data, $score);
        } else {
            $data = array(
                "name"        => $name,
                "phone"       => $phone, 
                "description" => $description,
                "updated_at"  => date('Y-m-d H:i:s')
            );
        }     

        $update = User::where('user_id', $user_id)->update($data);    
        if($update > 0) {
            if(isset($new_password)) {
                User::where('user_id', $user_id)->update(['password' => Hash::make($new_password)]);
            }
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'update_user',
                'message'=> 'User updated Successfully',
            ],200);
        } else {
            return response()->json([
                'response_code'=> 500,
                'service_name' => 'update_user',
                'message'=> 'Something wrong for updating user details',
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
            'user_id'      => $user->user_id,
            'admin_id'     => $admin_id,
            'set_score'    => $score,
            'before_score' => $user->balance,
            'after_score'  => $user->balance + $score,
            'ip'           => \Request::ip(),
            'type'         => 'player',
            'date_created' => date('Y-m-d H:i:s'),
            'date_modified'=> date('Y-m-d H:i:s')
        ]);
    }


    /**
     * Generate 10 digit unique username for Player.
     *
     */
    public function generate_unique_username(Request $request)
    {
        $unique_username = random_string('numeric',10);
        return response()->json(['response_code'=> 200,'service_name' => 'generate_unique_username','data' => $unique_username],200);
    }

    private function addBalance($agent, $playerId, $score)
    {
        $checkPlayer = User::where('user_id', $playerId)->first();
        if($checkPlayer) {
            $updateBalance = User::where('user_id', $checkPlayer->user_id)->update(['balance' => $checkPlayer->balance + $score]);
            if($agent->role_id == 2) {
                Agent::where('admin_id', $agent->admin_id)->decrement('balance', $score); 
            }

            PaymentDepositTransaction::insert([
                'user_id'      => $checkPlayer->user_id,
                'admin_id'     => $agent->admin_id,
                'set_score'    => $score,
                'before_score' => $checkPlayer->balance,
                'after_score'  => $checkPlayer->balance + $score,
                'ip'           => \Request::ip(),
                'type'         => 'player',
                'date_created' => date('Y-m-d H:i:s'),
                'date_modified'=> date('Y-m-d H:i:s')
            ]);

            PaymentHistoryTransaction::insert([
                'user_id'       => $checkPlayer->user_id,
                'ip'            => \Request::ip(),
                'game_id'       => 0,
                'action'        => 'SetScore',
                'win'           => $score,
                'begin_money'   => 0,
                'end_money'     => 0,
                'is_redpacket_calculated' => 1,
                'created_at'    => date('Y-m-d H:i:s'),
                'updated_at'    => date('Y-m-d H:i:s')
            ]);

            History::create(['action_for' => 0, 'to_id' => $checkPlayer->user_id, 'from_id' => $agent->admin_id, 'name' => $checkPlayer->username, 'description' => 'Score set successfully', 'last_ip' => \Request::ip(), 'type' => 1, 'set_score' => $score, 'before_score' => $checkPlayer->balance, 'after_score'  => $checkPlayer->balance + $score, 'payment_type' => 0, 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')]);
        
             return;   
        }
        
    }


}
