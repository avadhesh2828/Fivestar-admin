<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\PageContent;
use DB;
use Validator;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        
        $pageContent = new PageContent;
        // Partial Keyword Search Filter with player name
        if($request->keyword != "" )
        {
            $pageContent = $pageContent->where('page_title','ilike', '%'.$request->keyword.'%');
        }
        $pageContent = $pageContent->orderBy('page_content_id','DESC');
        $pageContent = $pageContent->paginate($request->per_page);
        return response()->json(['response_code'=> 200,'service_name' => 'page_content_list','data' => $pageContent]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request)
    {
        $page_data = pageContent::where('page_content_id',$request->page_content_id)->first();

    	return response()->json(['response_code'=>200,'data'=>$page_data]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $post_values['page_title']    = strip_tags(trim($request->post('page_title')));
        $post_values['page_description']     = $request->post('page_description');

        $result = pageContent::where('page_content_id',$request->post('page_content_id'))->update($post_values);
        return response()->json(['service_name' => 'update_user_profile','message'=>'Page content updated successfully.','data'=>array()],200);
    }
}
