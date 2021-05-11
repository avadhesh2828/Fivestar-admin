<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\AppVersion;
use Auth;
use DB;
use Validator;

class SettingController extends Controller
{
    /**
     * Display a listing of the Red Packet
     *
     */
    public function get_version(Request $request)
    {
        $version = AppVersion::first();
        
        return response()->json([
            'response_code' => 200,
            'service_name'  => 'get_version',
            'data'          => $version
        ],200);

    }

    /**
     * Update Version.
     *
     */
    public function update_version($versionId, Request $request)
    {
        $android_version = $request->post('android_version');
        $android_link    = $request->post('android_link');
        $ios_version     = $request->post('ios_version');
        $ios_link        = $request->post('ios_link');
        //validation
        $validator = Validator::make($request->all(), [
            "android_version" => 'required',
            "android_link"    => 'required',
            "ios_version"     => 'required',
            "ios_link"        => 'required'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'update_version',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }
        $checkVersion = AppVersion::first();
        if($android_version >= $checkVersion->android_version && $ios_version >= $checkVersion->ios_version) {
            $update = AppVersion::where('id', $checkVersion->id)->update([
                "android_version" => $android_version,
                "android_link"    => $android_link,
                "ios_version"     => $ios_version,
                "ios_link"        => $ios_link,
                "updated_at"      => date('Y-m-d H:i:s')
            ]);
            if($update > 0){
                return response()->json([
                    'response_code'=> 200,
                    'service_name' => 'update_version',
                    'message'=> 'Version updated Successfully',
                ],200);
            }else{
                return response()->json([
                    'response_code'=> 500,
                    'service_name' => 'update_version',
                    'global_error' =>  'Someting wrong for updating version',
                    'message'=> 'Someting wrong for updating version',
                ],500);
            }

        } else {
            return response()->json([
                'response_code'=> 500,
                'service_name' => 'update_version',
                'global_error' => 'Version must have greater than '.$checkVersion->version.' characters',
                'message'=> 'Version must have greater than '.$checkVersion->version.' characters',
            ],500);
        }

        


    }
}