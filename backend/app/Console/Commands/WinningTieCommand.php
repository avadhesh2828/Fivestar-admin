<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\Contest;
use App\Models\Master_Prize;


class WinningTieCommand extends Command
{
    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct($contest, $numberOfWinningPlace, $wonParticipantsList, $winningAmountPerPlace) {
		$this->contest = $contest;
		$this->number_of_winning_place = $numberOfWinningPlace;
		$this->won_participants_list = $wonParticipantsList;
		$this->winning_amount_per_place = $winningAmountPerPlace;
  }


    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
  {
    $tieUpPlaces =  $this->tie_up_places();

    $contestUserPrimeWithAmount =  $this->evaluate_prize_per_place($tieUpPlaces);
    return $this->add_amount_to_won_participants_list($contestUserPrimeWithAmount);
	}

	private function tie_up_places() {
    $userScores = $this->total_scores_per_users();

    return array_count_values($userScores);
	}

	private function total_scores_per_users() {

    return  array_column($this->won_participants_list->toArray(), 'score', 'fighter_pick_id');
	}

	private function evaluate_prize_per_place( $tieUpPlaces ) {
    $remainingPrizePlace = $this->number_of_winning_place;
    $userScores = $this->total_scores_per_users();

    $finalAmountPerUser = array();
    $dpp = 0;         // $distributed_prize_place
    foreach ($tieUpPlaces as $curScore => $prizeCount) {
        $totalAmountOnCurrentPosition = 0;
        $loopCount = 0;

        if ($prizeCount < $remainingPrizePlace) {
            $loopCount = $prizeCount;

            for ($j = 1; $j <= $loopCount; $j++) {
                $prize_posi = $j + $dpp;
                $totalAmountOnCurrentPosition = $totalAmountOnCurrentPosition + ($this->winning_amount_per_place[$prize_posi]);
            }

            $eachUserPrizeAmount = $totalAmountOnCurrentPosition / $prizeCount;
            foreach ($userScores as $uid => $score) {
                if ($score == $curScore) {
                    $finalAmountPerUser[$uid] = $eachUserPrizeAmount;
                }
            }
        } else {
            if ($prizeCount == $remainingPrizePlace) {
                $loopCount = $prizeCount;
            } else {
                $loopCount = $remainingPrizePlace;
            }

            for ($j = 1; $j <= $loopCount; $j++) {
                $prize_posi = $j + $dpp;
                $totalAmountOnCurrentPosition = $totalAmountOnCurrentPosition + ($this->winning_amount_per_place[$prize_posi]);
            }

            $eachUserPrizeAmount = $totalAmountOnCurrentPosition / $prizeCount;

            foreach ($userScores as $uid => $score) {
                if ($score == $curScore) {
                    $finalAmountPerUser[$uid] = $eachUserPrizeAmount;
                }
            }
        }

        // When all prize position has been complete then break the loop
        $remainingPrizePlace = $remainingPrizePlace - $prizeCount;
        $dpp = $dpp + $prizeCount;

        if ($remainingPrizePlace <= 0) break;

    }
    // End of tie_up_position loop
    return $finalAmountPerUser;
  }

  private function add_amount_to_won_participants_list( $contestUserPrimeWithAmount ) {
    foreach($this->won_participants_list as $key =>  &$val) {
      if(array_key_exists( $val['fighter_pick_id'], $contestUserPrimeWithAmount )) {
        $val['won_amount'] = $contestUserPrimeWithAmount[ $val['fighter_pick_id'] ];
      } else {
        unset($this->won_participants_list[$key ]);
      }
    }
    return $this->won_participants_list;
  }


}
