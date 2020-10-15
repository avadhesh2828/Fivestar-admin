<?php

namespace App\Http\Controllers\Contest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

# Models
use App\Models\Contest;
use App\Models\FighterPicks;
use App\Models\User;
use App\Models\Notification_model;
use DB;

# Libraries & Helpers

class ContestCancellationController extends Controller
{
  public function __construct(){
    $this->current_date = format_date();
  }

  public function index(Request $request) {

    # Cancel contests who's drafting time has been expired and drafting is not completed for all users
    $contest = Contest::where('contest_id', $request->contest_id)->first();
    if(empty($contest)) {
      echo 'No contests found!';
    }
    $fighterPic = FighterPicks::where('contest_id', $contest->contest_id)->get()->toArray();

    if(!empty($fighterPic)) {
      $notification_data = array();
      $transction_history = array();
      $user_ids = array_column($fighterPic, 'user_id'); 
      foreach ($user_ids as $key => $user_id) {
        //create notification array
        $notification_data[] = array(
          'notification_type_id' => "1",
          'receiver_user_id'     => $user_id,
          'notification'         => "Contest <b>$contest->contest_name</b> has been cancelled",
          'updated_date'         => $this->current_date,
        );
        //create transction history array
        $transction_history[] = array(
          'payment_for'	        => 3,
          'payment_type'	      => 0,
          'user_id'             => $user_id,
          'amount'              => $contest->entry_fees,
          'currency_code'       => "USD",
          'description'         => "Contest <b>$contest->contest_name</b> has been cancelled. refined contest entry fees <b>$contest->contest_name</b>",
          'created_date'        => $this->current_date,
          //'updated_date'         => $this->current_date,
        );
        //refined user balance
         $user = User::find($user_id);
         $user->balance += $contest->entry_fees;
         $user->save();
      }
      $phid = DB::table('finanace.payment_history_transactions')->insert($transction_history);
      $nid = DB::table('users.notifications')->insert($notification_data);
    }
    //update contest status
    $contest->status = 3;
    $contest->save();
    return response()->json(['response_code'=>200,'service_name'=>'get_all_notifications','message'=>"Contest has been cancelled."]);
  }

  private function cancel_drating_pending_contests($contest_id)
  {
    # Pull out contests who's drafting time has been expired
    if(!empty($contest)){
      $fighterPic = FighterPicks::where('contest_id', $contest->contest_id)->get();
      
      $this->process_refunding($fighterPic, $contest->entry_fees);
      //$contest->status = 3;
      //$contest->save();
    }
    return $contest;
  }

  private function process_refunding($fighterPic , $entry_fees) 
  {
    if($entry_fees > 0) {
      $user_ids = array_column($fighterPic, 'user_id');
      // $participant->balance += $historyTransaction->amount;
      // $participant->save(); 
    }

		return true;

	}
}
