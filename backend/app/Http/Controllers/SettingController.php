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
        $version = $request->post('version');
        $link    = $request->post('link');
        //validation
        $validator = Validator::make($request->all(), [
            "version" => 'required',
            "link"    => 'required'
        ]);

        if($validator->fails()){
            return response()->json([
            'response_code'=> 400,
            'service_name' => 'update_version',
            'message'=> 'Validation Failed',
            'global_error'=> $validator->errors()->first(),
            ], 400);
        }
        $checkVersion = AppVersion::where('id', $versionId)->first();
        if($version > $checkVersion->version) {
            $update = AppVersion::where('id', $versionId)->update([
                "version"     => $version, 
                "link"        => $link, 
                "updated_at"  => date('Y-m-d H:i:s')
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