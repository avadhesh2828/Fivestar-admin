<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Advertisment_model;
use App\Models\Ad_position;
use File;
use DB;
use Validator;
use Illuminate\Support\Facades\Gate;

class Advertisements extends Controller
{
    public function get_advertisement(Request $request)
    {
            \DB::enableQueryLog();
            $all_adv = new Advertisment_model;
            // Eager load relationship
            $all_adv = $all_adv->with('position');
            //status filter
            if (isset($request->status) && $request->status > -1) {
                $all_adv = $all_adv->where('status', $request->status);
            }
            // Partial Keyword Search Filter with player name
            if($request->keyword != "" )
            {
                $all_adv = $all_adv->where('ad_name','ilike', '%'.$request->keyword.'%');
            }
            $all_adv = $all_adv->orderBy('created_date','DESC');
            $all_adv = $all_adv->paginate($request->per_page);
            return response()->json(['response_code'=> 200,'service_name' => 'get_all_advertisment','data' => $all_adv],200);
        
    }

    public function create_ads(Request $request)
    {
        $data  = $request->post();
        $error = array();
        $rules = [];
        $rules['name'] = 'required';
        $rules['target_url'] ='required';
        $rules['position_type'] ='required';
        $rules['image_name'] ='required';
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails())
        {   
            $error = $validator->errors();
            $error_all = $validator->messages()->all();
            $message = $error_all[array_keys($error_all)[0]];
           return response()->json(['message'=>$message],500);             
        }  
        else
        {
            $post_data = array(
                'ads_unique_id'  => random_string('alnum',9), 
                'ad_name'           =>$data['name'], 
                'target_url'     => $data['target_url'], 
                'image_adsense'  => $data['image_name'],
                'ad_position_id' => $data['position_type'], 
                'created_date'   => format_date(),
                'modified_date'  => format_date(),
                'status'         => 1,
                'click_count'    => 0,
                'view_count'     => 0
            );

            // return $post_data;
            $advertisements = Advertisment_model::create($post_data); 
            if($advertisements)
            {
                return response()->json(['message'=>'advertisements created successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }
            else
            {
                $image_path = \Config::get('constants.ROOT_IMAGE_PATH').$data['image_name'];
                if( file_exists($image_path) ){
                  unlink($image_path);
                }
                return response()->json(['message'=>'Please Try Create Advertisements.'],500);
            }
            
        }     	  	
    }

    public function get_positions(Request $request)
    {
    	$result = Ad_position::where('status',1)->get();
    	return response()->json(['data'=>$result])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);

    }

    public function do_upload(Request $request)
    {
        $file = $request->file('file');
        // generate a new filename. getClientOriginalExtension() for the file extension

    	$pos_type = $request->pos_type;
    	$type_detail  = Ad_position::where('ad_position_id', $pos_type)->first();
    	$file_field_name = 'file';
    	$temp_file = $_FILES['file']['tmp_name'];
    	$ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    	$vals = @getimagesize($temp_file);
		$width = $vals[0];
		$height = $vals[1];

		if ($height != $type_detail['height'] || $width != $type_detail['width'])
		{
			$invalid_size = str_replace("{max_height}",$type_detail['height'],'Invalid Image Size');
			$invalid_size = str_replace("{max_width}",$type_detail['width'],$invalid_size);
			return response()->json(['message'=>$invalid_size],500);
		}

		// $this->check_folder_exist($dir);
		$file_name = time() . "." . $ext;
		// return $file_name;
		$config['allowed_types'] = 'jpg|png|jpeg|gif';
		$config['max_size'] = '4048'; //204800
		$config['max_width'] = '1024';
		$config['max_height'] = '1000';
		// $config['upload_path'] = $dir;
		$config['file_name'] = $file_name;

        $path = "uploads/advertisment";
         if (\Storage::disk('local')->exists($path)) 
          {
              \Storage::makeDirectory($path, 0777);
          }

        $path = $file->storeAs($path, $file_name);
		$data['image_path'] = \Config::get('constants.ROOT_IMAGE_PATH').$path;
		$data['file_name'] = $file_name;
		return response()->json(['data'=>$data])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);

    }

    public function check_folder_exist($dir)
	{
		if (!is_dir($dir))
			mkdir($dir, 0777);
	}
	public function change_adv_status(Request $request)
	{
      	$data_arr = array('status' => $request->post('status'));
		$results= Advertisment_model::where('ads_unique_id',$request->post('ads_unique_id') )->update($data_arr);
        $result = Advertisment_model::where('ads_unique_id','!=',$request->post('ads_unique_id'))->update(array('status'=>0));
    	$api_response_arry['data'] = $results;
        return response()->json(['results'=>$api_response_arry,'message'=>'Advertisements updated susscssfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
	}

	public function delete_advertisement(Request $request)
	{
		$ads_unique_id = $request->post('ads_unique_id');
		$advertisement = Advertisment_model::where('ads_unique_id',$ads_unique_id)->first();
		// $image_path = \Config::get('constants.IMAGE_PATH').\Config::get('constants.AD_IMAGE_DIR').'/'.$advertisement['image_adsense'];
		\Storage::delete('uploads/advertisment/'.$advertisement['image_adsense']);
		$res=Advertisment_model::where('ads_unique_id',$ads_unique_id)->delete();
		return response()->json(['results'=>$res,'message'=>'Advertisements deleted susscssfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
	}
}
