<?php

namespace App\Http\Controllers;

use LaravelFCM\Message\OptionsBuilder;
use LaravelFCM\Message\PayloadDataBuilder;
use LaravelFCM\Message\PayloadNotificationBuilder;
use FCM;

use Illuminate\Http\Request;
use DB;
use Validator;
use App\Models\Notification_model;
use App\Models\Notification_Type;
use App\Models\User;
use App\Helpers\Notification;
class NotificationController extends Controller
{
    //
	public function get_notification_types($type)
	{
		$query = Notification_Type::select('notification_type_id')->where('notification_type',$type)->orderBy('notification_type_id', 'DESC')->first();
		return $query;
	}
	public function add_new_notification(Request $request)
	{

		if (empty($request->post()))
		{
			return response()->json(['response_code'=>500,'service_name'=>'add_new_notification','message'=>'Entered required field.']);
		}
		$error       = array();
		$rules = [];
		$rules['notification_title'] = 'required';
		$rules['notification_content'] = 'required';
        $rules['receiver_user_ids'] ='required';
        $customMessages = [
			'notification_title.required' => 'Notification Title',
        	'notification_content.required' => 'Notification Content',
        	'receiver_user_ids.required'  =>'Receiver User Id'
		];
        $validator = Validator::make($request->all(), $rules,$customMessages);
        if ($validator->fails())
        {
            $error = $validator->errors();
            $error_all = $validator->messages()->all();
            $message = $error_all[array_keys($error_all)[0]];
            return response()->json(['response_code'=>422,'service_name' => 'add_new_notification','message'=>$message,'error'=>$error,'global_error'=>$error]);
        }
		if (empty($request->post('receiver_user_ids')))
        {
      		return response()->json(['response_code'=>422,'service_name' => 'add_new_notification','message'=>'Entered required field','error'=>'','global_error'=>'']);
      	}
      	$notification_type_id = $this->get_notification_types("BULK_NOTIFICATION");

      	$sender_user_id = 0;
		$receiver_user_ids =    $request->post('receiver_user_ids');
		$notification_content = $request->post('notification_content');
		$notification_title = $request->post('notification_title');
		$current_date = format_date();

		$data = array();
		foreach ($receiver_user_ids as $receiver_user_id) {
			// $data[] = array(
			$insert_notification= new Notification_model();
		    $insert_notification->notification_type_id = $notification_type_id['notification_type_id'];
	    	$insert_notification->sender_user_id = $sender_user_id;
			$insert_notification->receiver_user_id = $receiver_user_id;
			$insert_notification->notification = $notification_content;
			$insert_notification->title = $notification_title;
			$insert_notification->created_date = $current_date;
			$insert_notification->updated_date = $current_date;
			$insert_notification->save();
			// );
		}

		$user_to_send_notification = User::select('device_token')->whereIn('user_id',$receiver_user_ids)->get()->toArray();
		$device_token = array_diff(array_column($user_to_send_notification, 'device_token'),['']);
		if(!empty($device_token)) {
			$response = Notification::send_notification($notification_title,$notification_content,$device_token);
		}


        return response()->json(['response_code'=>200,'service_name'=>'get_all_notifications','data'=>$insert_notification,'message'=>'Add New Notifications']);
	}

	public function get_all_notifications(Request $request)
	{
		$limit = 20;
		$page = 0;
		$sort_field = 'notification_id';
		$sort_order = 'ASC';
		$post = $request->post();
		if (isset($post["itemsPerPage"]) && $post["itemsPerPage"] != 0) {
			$limit = $post['itemsPerPage'];
		}
		if (isset($post['currentPage']) && $post['currentPage'] != 0) {
			$page = $post['currentPage'] - 1;
		}
		$query = DB::table('users.notifications as N');
		$query->select('N.notification_id','U.username as receiver_username','U.name','N.title','N.notification', 'N.is_read', 'N.created_date', 'N.updated_date');
		$query->leftJoin('users.user as U','U.user_id', '=', 'N.receiver_user_id');
		$query->where('N.sender_user_id', '0');
	    $offset   = $limit * $page;
        $tempdb = clone $query;
		$query = $query->get();
		$results['total'] = $query->count();
		$results['Notifications'] = $tempdb->orderBy($sort_field, $sort_order)->offset($offset)->limit($limit)->get();

		if ($results['Notifications']) {
			foreach ($results['Notifications'] as $key => &$value) {
				$value->receiver_username = $value->receiver_username;
			}
		} else {
			$$results['Notifications'] = array();
		}
		return response()->json(['response_code'=>200,'service_name'=>'get_all_notifications','data'=>$results,'message'=>'All Notifications']);
	}

	public function fcm_notifications(Request $request)
	{
		$optionBuilder = new OptionsBuilder();
		$optionBuilder->setTimeToLive(60*20);

		$notificationBuilder = new PayloadNotificationBuilder('my title');
		$notificationBuilder->setBody('Hello world')
							->setSound('default');

		$dataBuilder = new PayloadDataBuilder();
		$dataBuilder->addData(['a_data' => 'my_data']);

		$option = $optionBuilder->build();
		$notification = $notificationBuilder->build();
		$data = $dataBuilder->build();

		$token = "d0zPzZdARlOFiWkmDMPcDN:APA91bGcCsszecmYbQ3iK2k8U1abewC8LtqZG-EyX6EGG1pesa7uS4mp8FhJz6bz1KTD2uZDJdaoekQwUXPP2y-YShI7UGdRnxrwVMtKetYXFAYVACxFpF1KbeA6f1c-UY89XdDxLLgy";

		$downstreamResponse = FCM::sendTo($token, $option, $notification, $data);

		$downstreamResponse->numberSuccess();
		print_r($downstreamResponse);
		die("ffffff");
		$downstreamResponse->numberFailure();
		$downstreamResponse->numberModification();

		// return Array - you must remove all this tokens in your database
		$downstreamResponse->tokensToDelete();

		// return Array (key : oldToken, value : new token - you must change the token in your database)
		$downstreamResponse->tokensToModify();

		// return Array - you should try to resend the message to the tokens in the array
		$downstreamResponse->tokensToRetry();

		// return Array (key:token, value:error) - in production you should remove from your database the tokens
		$downstreamResponse->tokensWithError();
	}
}
