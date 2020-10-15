<?php

namespace App\Helpers;
use App\Models\FighterPicks;
use App\Models\MasterPrize;
use App\Console\Commands\WinningTieCommand;

class Winner{

    public static function contest_winner($contest)
  {
    $masterPrizePayouts =  self::get_master_prize_payout();
    $numberOfWinningPlace	= self::calculate_winning_count($contest, $masterPrizePayouts);
    $wonParticipantsList		= self::get_winners_ids($numberOfWinningPlace, $contest);
    $winningAmountPerPlace =  self::evaluate_prize_per_place($contest, $masterPrizePayouts);
    if(self::has_scores_tie_exist($wonParticipantsList->toArray())) 
    {
      // Tie condition
      $tieResult = dispatch(new WinningTieCommand($contest, $numberOfWinningPlace, $wonParticipantsList, $winningAmountPerPlace));

    } 
    return $wonParticipantsList;
  }
  public static function get_master_prize_payout() 
  {
    $payouts =  MasterPrize::all();

    $output = array();
    foreach($payouts as &$val) {
        $val['composition'] = json_decode($val['composition'], true);
        if($val['master_prize_id'] == 1) {$output[0] = $val; }
        $output[$val['master_prize_id'] ] = $val;
    }
    return $output;
  }
  public static function calculate_winning_count($contest, $masterPrizePayouts) 
  {
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

  public static function get_winners_ids($numberOfWinningPlace = 1, $contest) {
    return FighterPicks::with('user')->where('contest_id', $contest->contest_id)
    ->orderBy('score', 'DESC')
    ->limit($numberOfWinningPlace)
    ->get();

  }

  public static function evaluate_prize_per_place($contest, $masterPrizePayouts) 
  {
      $payoutsComposition = $masterPrizePayouts[ $contest->master_prize_id ]->composition;
      $output = array();

      if(! is_integer( $payoutsComposition[0]['max_place']) ) {
        $divisor      = explode('/',$payoutsComposition[0]['max_place'])[1];
        $divisor      = ($divisor ==0)? 1 : $divisor;
        $winner_count = (int) ($contest->size/ $divisor );
        $rewards      = $contest->prize_pool / $winner_count;

        for ($k=1; $k <= $winner_count; $k++) { $output[$k] = round( (float)$rewards , 2 );  }

    } else {
          foreach($payoutsComposition as $val) {
              $amount = ($contest->prize_pool * $val['value'] ) / 100 ;
            $output[ $val['max_place'] ] = round( (float)$amount , 2 );
        }
    }
    return $output;
  }

  public static function has_scores_tie_exist($wonParticipantsList) 
  {
    $totalUsersList = array_column($wonParticipantsList, 'fighter_pick_id');
    $totalScoreList = array_column($wonParticipantsList, 'score');

    return ( count(array_unique($totalUsersList))  != count(array_unique($totalScoreList)) );
  }

  public static function tie_process_refunding($contest, $tieResult) 
  {
    if(empty($tieResult)) { return FALSE; }

    $winningAmountPerPlace = array();
    foreach($tieResult as $key => $val) {
        $winningAmountPerPlace[$key+1] = $val['won_amount'];
    }
    return TRUE;
  }
}
