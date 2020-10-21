<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\User;
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
        $users = $users->where('parent_id', $user_id);
        $users = $users->where('status', $request->status);
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
        //validation
        $validator = Validator::make($request->all(), [
            'username' => 'required|unique:pgsql.users.user,user_name|min:7|max:16',
            'password' => 'required|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'score'    => 'required|numeric',
            'name'     => 'required',
            'phone'    => 'required'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'create_user',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }

        User::create([
            "user_name"     => $username,
            "password"      => Hash::make($password),
            "balance"       => $score,
            "name"          => $name,
            "phone"         => $phone,
            "description"   => $description,
            "status"        => 1,
            "parent_id"     => $agent_id,
            "user_unique_id"   => random_string('alnum', 9),
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

}
