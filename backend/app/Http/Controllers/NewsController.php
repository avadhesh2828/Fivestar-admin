<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\News;
use App\Models\Ad_position;
use App\Models\Match;
use File;
use DB;
use Validator;

class NewsController extends Controller
{
    public function get_all_news(Request $request)
    {
        \DB::enableQueryLog();
        $all_news = new news;
        // Partial Keyword Search Filter with player name
        if($request->keyword != "" )
        {
            $all_news = $all_news->where('news_title','ilike', '%'.$request->keyword.'%');
        }
        $all_news = $all_news->orderBy('publication_date','ASC');
        $all_news = $all_news->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'get_all_news','data' => $all_news]);
    }

    public function create_news(Request $request)
    {
        $data  = $request->post();
        $error = array();
        $rules = [];
        $rules['title'] = 'required';
        $rules['isFeatured'] ='required';
        $rules['newsDescription'] ='required';
        $rules['image_name'] ='required';
        $rules['publicationDate'] ='required';
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
                'news_title'           =>$data['title'],
                'news_description'     => $data['newsDescription'],
                'news_cover_image'  => $data['image_name'],
                'news_video_url'  => $data['videoURL'],
                'is_featured' => $data['isFeatured'],
                'publication_date' => date('Y-m-d', strtotime($data['publicationDate'])),
                'created_at'   => format_date(),
                'updated_at'  => format_date(),
            );

            // return $post_data;
            $advertisements = News::create($post_data);
            if($advertisements)
            {
                return response()->json(['message'=>'News created successfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
            }
            else
            {
                $image_path = \Config::get('constants.ROOT_IMAGE_PATH').$data['image_name'];
                if( file_exists($image_path) ){
                  unlink($image_path);
                }
                return response()->json(['message'=>'Please Try Create News.'],500);
            }

        }
    }

    public function do_upload(Request $request)
    {
        $file = $request->file('file');
        // generate a new filename. getClientOriginalExtension() for the file extension

    	//$pos_type = $request->pos_type;
    	//$type_detail  = Ad_position::where('ad_position_id', 1)->first();
    	$file_field_name = 'file';
    	$temp_file = $_FILES['file']['tmp_name'];
    	$ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    	$vals = @getimagesize($temp_file);
		$width = $vals[0];
		$height = $vals[1];

		// if ($height != $type_detail['height'] || $width != $type_detail['width'])
		// {
		// 	$invalid_size = str_replace("{max_height}",$type_detail['height'],'Invalid Image Size');
		// 	$invalid_size = str_replace("{max_width}",$type_detail['width'],$invalid_size);
		// 	return response()->json(['message'=>$invalid_size],500);
		// }

		// $this->check_folder_exist($dir);
		$file_name = time() . "." . $ext;
		// return $file_name;
		$config['allowed_types'] = 'jpg|png|jpeg|gif';
		$config['max_size'] = '4048'; //204800
		$config['max_width'] = '1024';
		$config['max_height'] = '1000';
		// $config['upload_path'] = $dir;
		$config['file_name'] = $file_name;

        $path = "uploads/news";
         if (\Storage::disk('local')->exists($path))
          {
              \Storage::makeDirectory($path, 0777);
          }

        $path = $file->storeAs($path, $file_name);
		$data['image_path'] = \Config::get('constants.ROOT_IMAGE_PATH').$path;
		$data['file_name'] = $file_name;
		return response()->json(['data'=>$data])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);

    }

    public function delete_news(Request $request)
	{
        $news_id = $request->post('news_id');
        $match_res = Match::orWhere('preview_id',$news_id)->orWhere('review_id',$news_id)->first();
        if (!empty($match_res)) {
            return response()->json(['message'=>'Permission denied. news exist in match list'],500);
        }else {
            $news_data = News::where('news_id',$news_id)->first();
		    // $image_path = \Config::get('constants.IMAGE_PATH').\Config::get('constants.AD_IMAGE_DIR').'/'.$advertisement['image_adsense'];
		    \Storage::delete('uploads/news/'.$news_data['news_cover_image']);
            //$res=News::where('news_id',$news_id)->delete();
            $res = News::find($news_id)->delete();
		    return response()->json(['results'=>$res,'message'=>'News deleted susscssfully'])->setStatusCode(Response::HTTP_OK, Response::$statusTexts[Response::HTTP_OK]);
        }
    }

    //this function get only single news detail
    public function get_news_by_id(Request $request)
    {

    	$news_id = $request->news_id;
        $news_data = News::where('news_id',$news_id)->first();

    	return response()->json(['response_code'=>200,'data'=>$news_data]);
    }

    //this function update only single news detail
    public function update_news(Request $request)
    {
        $image_name = $request->post('image_name');
        if($image_name !=""){
            $post_values['news_cover_image'] = $image_name;
        }
        if($request->post('isFeatured') !=""){
            $post_values['is_featured']     = $request->post('isFeatured');
        }
        $post_values['news_title']    = strip_tags(trim($request->post('title')));
        $post_values['news_description']     = strip_tags(trim($request->post('newsDescription')));
        $post_values['news_video_url']     = $request->post('videoURL');
        $post_values['publication_date']     = $request->post('publicationDate');
        $post_values['updated_at'] = format_date();
        $condition = array('news_id' => $request->post('news_id'));

        $result = News::where($condition)->update($post_values);
        return response()->json(['service_name' => 'update_user_profile','message'=>'News updated successfully.','data'=>array()],200);
    }
}
