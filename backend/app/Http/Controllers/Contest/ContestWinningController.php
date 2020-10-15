<?php

namespace App\Http\Controllers\Contest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
# Models
use App\Models\Contest;
use App\Models\SubContest;
use App\Models\MasterPrize;
use App\Models\User;
use App\Models\PaymentHistoryTransaction;
use App\Models\FighterPicks;
use App\Models\Lineups;
use App\Models\MasterGameStyle;
use App\Models\Notification_model;
use App\Helpers\Notification;
use App\Console\Commands\WinningTieCommand;
use App\Helpers\Winner;
use DB;

class ContestWinningController extends Controller
{
    public function __construct() {
        $this->current_date = format_date();
      }
      public function complete_contest(Request $request)
      {

        set_time_limit(0);

        $liveContests = Contest::where('contest_id',$request->contest_id)->get();
        $masterPrizePayouts =  $this->get_master_prize_payout();

        foreach($liveContests as $contest) {

          $numberOfWinningPlace	= $this->calculate_winning_count($contest, $masterPrizePayouts);

          $wonParticipantsList		= $this->get_winners_ids($numberOfWinningPlace, $contest);
          $winningAmountPerPlace =  $this->evaluate_prize_per_place($contest, $masterPrizePayouts);

          if($this->has_scores_tie_exist($wonParticipantsList->toArray())) {
                    // Tie condition

             $tieResult = $this->dispatch(new WinningTieCommand($contest, $numberOfWinningPlace, $wonParticipantsList, $winningAmountPerPlace));
             $this->tie_process_refunding($contest, $tieResult);

                } else {
                    // No tie exist
                    $this->process_refunding($contest, $wonParticipantsList, $winningAmountPerPlace);
          }
          $winners = Winner::contest_winner($contest);
          Contest::where('contest_id', $contest['contest_id'])
          ->update([
            'status' => 4
          ]);
          //Fighter pics notification
          $fighterPicksData = FighterPicks::where('contest_id',$contest['contest_id'])->get()->toArray();
          $receiver_user_ids = array_column($fighterPicksData, 'user_id');
          $user_to_send_notification = User::select('device_token')->whereIn('user_id',$receiver_user_ids)->get()->toArray();
          //$device_token = array_column($user_to_send_notification, 'device_token');
          $device_token = array_diff(array_column($user_to_send_notification, 'device_token'),['']);
          $response = Notification::send_notification('Contest','Contest has been completed.',$device_token);
        }

        //Winner notification
        foreach ($winners as $key => $value) {
          $user_data = User::select('device_token')->where('user_id',$value->user_id)->first();
          $notification_message = "Congratulations! You have won the ".$contest['contest_name']." ". $value['won_amount']." has been credited into your wallet.";
          if(!empty($user_data->device_token)) {
            $response = Notification::send_notification('Contest Winning',$notification_message,$user_data->device_token);
          }
      
          Notification_model::create([
            'notification_type_id' => 1,
            'sender_user_id'		   => 0,
            'receiver_user_id'	   => $value->user_id,
            'notification'	       => "Congratulations! You have won the ".$contest['contest_name']." amount ". $value['won_amount']." $ has been credited into your wallet.",
            'created_date'				 => format_date(),
            'updated_date'				 => 1,
          ]);
        }

        return response()->json([
          'response_code'=> 200,
          'service_name' => 'contest_complete',
          //'data' => $contest,
          'message'=> 'Contests Completed, Winners Declared!',
        ]);

        //echo 'Contests Completed, Winners Declared!';

      }

      private function get_master_prize_payout() {
            $payouts =  MasterPrize::all();

            $output = array();
            foreach($payouts as &$val) {
                $val['composition'] = json_decode($val['composition'], true);
                if($val['master_prize_id'] == 1) {$output[0] = $val; }
                $output[$val['master_prize_id'] ] = $val;
            }
            return $output;
      }

      private function calculate_winning_count($contest, $masterPrizePayouts) {
          $payoutsComposition = $masterPrizePayouts[ $contest->master_prize_id ]->composition;

          if(! is_integer( $payoutsComposition[0]['max_place']) ) {
              $divisor = explode('/',$payoutsComposition[0]['max_place'])[1];

              $divisor = ($divisor ==0)? 1 : $divisor;

              return (int)($contest->size/ $divisor );
          } else {
              $last_element = array_pop($payoutsComposition);
              return $last_element['max_place'];
        }

      }

      private function get_winners_ids($numberOfWinningPlace = 1, $contest) {
        return FighterPicks::where('contest_id', $contest->contest_id)
        ->orderBy('score', 'DESC')
        ->limit($numberOfWinningPlace)
        ->get();

      }

      private function evaluate_prize_per_place($contest, $masterPrizePayouts) {
            $payoutsComposition = $masterPrizePayouts[ $contest->master_prize_id ]->composition;
            $output = array();

            if(! is_integer( $payoutsComposition[0]['max_place']) ) {
              $divisor      = explode('/',$payoutsComposition[0]['max_place'])[1];
              $divisor      = ($divisor ==0)? 1 : $divisor;
              $winner_count = (int) ($contest['size']/ $divisor );
              $rewards      = $contest['prize_pool'] / $winner_count;

              for ($k=1; $k <= $winner_count; $k++) { $output[$k] = round( (float)$rewards , 2 );  }

          } else {
                foreach($payoutsComposition as $val) {
                    $amount = ($contest['prize_pool'] * $val['value'] ) / 100 ;
                  $output[ $val['max_place'] ] = round( (float)$amount , 2 );
              }
          }
          return $output;
      }

      private function has_scores_tie_exist($wonParticipantsList) {
          $totalUsersList = array_column($wonParticipantsList, 'fighter_pick_id');
          $totalScoreList = array_column($wonParticipantsList, 'score');

          return ( count(array_unique($totalUsersList))  != count(array_unique($totalScoreList)) );
      }

      private function tie_process_refunding($contest, $tieResult) {
            if(empty($tieResult)) { return FALSE; }

            $winningAmountPerPlace = array();
            foreach($tieResult as $key => $val) {
                $winningAmountPerPlace[$key+1] = $val['won_amount'];
            }
            $this->process_refunding($contest, $tieResult, $winningAmountPerPlace);
            return TRUE;
      }

      private function process_refunding($contest, $wonParticipantsList, $winningAmountPerPlace) {

        if(empty($wonParticipantsList)) { return FALSE; }

            foreach($wonParticipantsList as $key => $participant) {

                $amount = $winningAmountPerPlace[$key+1];

          User::where('user_id', $participant['user_id'])
          ->update([
            "winning_balance" => DB::raw('winning_balance + ' . $amount)
          ]);

          PaymentHistoryTransaction::create([
            'payment_for'	              => 2,
            'user_id'		                => $participant['user_id'],
            'contest_id'	              => $contest['contest_id'],
            'description'	              => 'Won game "'.$contest['contest_name'].' "',
            'payment_type'	            => 0,
            'amount'		                => $amount,
            'created_date'				      => format_date(),
            'is_processed'				      => 1,
          ]);

        //   LineupMaster::where('lineup_master_id', $participant['lineup_master_id'])
        //   ->update([
        //     "status" => 3
        //   ]);
            }
            return TRUE;
        }
}
