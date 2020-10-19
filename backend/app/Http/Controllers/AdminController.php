<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Validator;

class AdminController extends Controller
{

    // public function login(){
    //     if(\Auth::attempt(['username' => request('username'), 'password' => request('password')])){
    //         $user = \Auth::user();
    //         // print_r($user);die;
    //         $success['session_key'] =  'Bearer '.$user->createToken('MyLance Admin')->accessToken;
    //         return response()->json(['Data' => $success])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
    //     }
    //     else{
    //       $error['email'] = 'Incorrect credentials!';
    //         return response()->json(['error'=>$error])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
    //     }
    // }

    public function login(){
        if(\Auth::attempt(['username' => request('username'), 'password' => request('password')])){
            $user = \Auth::user();
            if(!empty($user->personal_password)){
                return response()->json([
                    'response_code'=> 200,
                    'message'=> 'Verify security password',
                    'data'=> ['admin_id' => $user->admin_id, 'status' => 1 ] 
                ])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            } else {
                return response()->json([
                    'response_code'=> 200,
                    'message'=> 'Set security password',
                    'data'=> ['admin_id' => $user->admin_id, 'status' => 0 ]
                ])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }
        }
        else{
          $error['username'] = 'Incorrect credentials!';
            return response()->json(['error'=>$error])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
        }
    }

    public function verify_personal_password(){
        $personal_password = request('personal_password');
        $user = Admin::where(['admin_id' => request('admin_id')])->first();
        if($user){
            if(Hash::check($personal_password, $user->personal_password)){
                $update_data = array('last_login' => date('Y-m-d H:i:s'), 'last_ip' => \Request::ip());
                $where = array('admin_id' => $user->admin_id);
                $result =  Admin::where($where)->update($update_data);

                $success['session_key'] =  'Bearer '.$user->createToken('MyLance Admin')->accessToken;
                return response()->json([
                    'response_code'=> 200,
                    'service_name' => 'verify_personal_password',
                    'Data' => $success
                ])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]); 
            } else {
                $error['personal_password'] = "Security password doesn't match!";
                return response()->json(['error'=>$error])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
            }
        }
        else{
          $error['personal_password'] = 'Incorrect credentials!';
            return response()->json(['error'=>$error])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
        }
    }

    public function set_personal_password(Request $request){

        $admin_id = $request->post('admin_id');
        $security_password = $request->post('security_password');
        $security_password_confirmation = $request->post('security_password_confirmation');
        //validation
        $validator = Validator::make($request->all(), [
            'security_password' => 'required|min:6',
            'security_password_confirmation' => 'required_with:security_password|same:security_password|min:6'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'set_personal_password',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }    

        $user = Admin::where('admin_id', $admin_id)->update(['personal_password' => Hash::make($security_password)]);
        if($user > 0){
            $userAuth = Admin::where('admin_id', $admin_id)->first();
            
            $update_data = array('last_login' => date('Y-m-d H:i:s'), 'last_ip' => \Request::ip());
            $where = array('admin_id' => $userAuth->admin_id);
            $result =  Admin::where($where)->update($update_data);

            $success['session_key'] =  'Bearer '.$userAuth->createToken('MyLance Admin')->accessToken;
            return response()->json([
                'response_code'=> 200,
                'service_name' => 'set_personal_password',
                'Data' => $success
            ])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
        }
        else{
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'set_personal_password',
                'message'      => 'Someting wrong in set personal password ',
            ])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
        }
    }

    public function change_password(Request $request){
        $this->user = Auth::user();
        $user_id = $this->user->admin_id;
        $old_password = $request->post('old_password');
        $password = $request->post('password');
        $password_confirmation = $request->post('password_confirmation');
        //validation
        $validator = Validator::make($request->all(), [
            'old_password' => 'required',
            'password' => 'required|min:6',
            'password_confirmation' => 'required_with:password|same:password|min:6'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'change_password',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }    

        $adminInfo = Admin::where('admin_id', $user_id)->first();
        if(Hash::check($old_password, $adminInfo->password)) {
            $user = Admin::where('admin_id', $user_id)->update(['password' => Hash::make($password)]);
            if($user > 0){
                return response()->json([
                    'response_code'=> 200,
                    'service_name' => 'change_password',
                    'message'      => 'Password changed successfully',
                ])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }
            else{
                return response()->json([
                    'response_code'=> 400,
                    'service_name' => 'change_password',
                    'message'      => 'Someting wrong for change password ',
                ])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
            }
        } else {
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'change_password',
                'message'      => 'Old password does not match',
            ])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
        }

    }

    public function change_security_password(Request $request){
        $this->user = Auth::user();
        $user_id = $this->user->admin_id;
        $old_security_password = $request->post('old_security_password');
        $security_password = $request->post('security_password');
        $security_password_confirmation = $request->post('security_password_confirmation');
        //validation
        $validator = Validator::make($request->all(), [
            'old_security_password' => 'required',
            'security_password' => 'required|min:6',
            'security_password_confirmation' => 'required_with:security_password|same:security_password|min:6'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'change_security_password',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }    

        $adminInfo = Admin::where('admin_id', $user_id)->first();
        if(Hash::check($old_security_password, $adminInfo->personal_password)) {
            $user = Admin::where('admin_id', $user_id)->update(['personal_password' => Hash::make($security_password)]);
            if($user > 0){
                return response()->json([
                    'response_code'=> 200,
                    'service_name' => 'change_security_password',
                    'message'      => '2nd Security password changed successfully',
                ])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }
            else{
                return response()->json([
                    'response_code'=> 400,
                    'service_name' => 'change_security_password',
                    'message'      => 'Someting wrong for change security password ',
                ])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
            }
        } else {
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'change_security_password',
                'message'      => 'Old security password does not match',
            ])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
        }

    }

    public function logout(Request $request)
    {
        $request->user()->token()->delete();
        return response()->json(['Data' => 'successfully logout.'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
    }


}
