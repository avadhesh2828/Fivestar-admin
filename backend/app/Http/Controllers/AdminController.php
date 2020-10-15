<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Support\Facades\Auth;
use Validator;

class AdminController extends Controller
{

     public function login(){
        if(\Auth::attempt(['email' => request('email'), 'password' => request('password')])){
            $user = \Auth::user();
            // print_r($user);die;
            $success['session_key'] =  'Bearer '.$user->createToken('FightForIt Admin')->accessToken;
            return response()->json(['Data' => $success])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
        }
        else{
          $error['email'] = 'Incorrect credentials!';
            return response()->json(['error'=>$error])->setStatusCode(Response::HTTP_BAD_REQUEST, Response::$statusTexts[Response::HTTP_BAD_REQUEST]);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->token()->delete();
        return response()->json(['Data' => 'successfully logout.'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
    }


}
