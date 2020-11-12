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

        // $username = $request->post('username');
        $password = $request->post('password');
        $score    = $request->post('score');
        $name     = $request->post('name');
        $phone    = $request->post('phone');
        $description = $request->post('description');
        //validation
        $customMessages = [
            'password.regex' => 'Password must have one uppercase and must be alphanumeric.',
        ];
        $validator = Validator::make($request->all(), [
            // 'username' => 'required|numeric|unique:pgsql.users.user,username',
            'password' => 'required|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'score'    => 'required|numeric',
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
            "username"      => mt_rand(1111111111, 9999999999),
            "password"      => Hash::make($password),
            "balance"       => $score,
            "name"          => $name,
            "phone"         => $phone,
            "description"   => $description,
            "status"        => 1,
            "parent_id"     => $agent_id,
            "user_unique_id"=> random_string('alnum', 9),
            "created_at"    => date('Y-m-d H:i:s'),
            "updated_at"    => date('Y-m-d H:i:s')
        ]);

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

        $playerIp = new LoginHistory;
        $playerIp = $playerIp->select('user_login_history.*', 'U.username');
        $playerIp = $playerIp->join('users.user as U', function($q) {
            $q->on('U.user_id', '=', 'user_login_history.user_id');
        });
        $playerIp = $playerIp->where('U.parent_id', $admin_id);
        $playerIp = $playerIp->where('U.username', $username);
        $playerIp = $playerIp->orderBy('user_login_history.created_at', 'DESC');
        $playerIp = $playerIp->limit(10);
        $playerIp = $playerIp->get();

        return response()->json(['response_code'=> 200,'service_name' => 'get_login_history','data' => $playerIp],200);

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
            "username" => ['required']
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'search_user',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        $user = new User;
        $user = $user->select('user.*', 'A.username as agent_name');
        $user = $user->join('users.admins as A', function($q) {
            $q->on('A.admin_id', '=', 'user.parent_id');
        });
        $user = $user->where('user.parent_id', $admin_id);
        $user = $user->where('user.username', $username);
        $user = $user->get();

        return response()->json(['response_code'=> 200,'service_name' => 'search_user','data' => $user],200);

    }


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

}
