<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\PaymentHistoryTransaction;
use App\Models\User;
use App\Models\Player;

class DashboardController extends Controller
{
    public function get_all_stats(Request $request)
    {
        $data['total_user_available_balance'] = $this->get_total_user_balance();
        $data['total_deposit_amount'] = $this->get_total_deposited_amount();
        $data['total_withdraw_amount'] = $this->get_total_withdraw_amount();
        $data['total_winning_amount'] = $this->get_total_winning_amount();
        $data['total_user'] = $this->get_total_user();
        $data['total_player'] = $this->get_total_player();
        return response()->json([
            'response_code'=>200,
            'service_name'=>'dashboard',
            'data'=>$data
        ]);
    }

    private function get_total_user_balance()
    {
        $user = User::all()->sum('balance');
        return $user;
    }

    private function get_total_deposited_amount()
    {
        $deposit = PaymentHistoryTransaction::all()->where('payment_for',0)->sum('amount');
        return $deposit;
    }

    private function get_total_withdraw_amount()
    {
        $withdraw = PaymentHistoryTransaction::all()->where('payment_for',1)->sum('amount');
        return $withdraw;
    }

    private function get_total_winning_amount()
    {
        $withdraw = PaymentHistoryTransaction::all()->where('payment_for',2)->sum('amount');
        return $withdraw;
    }

    private function get_total_user()
    {
        $withdraw = User::all()->count('user_id');
        return $withdraw;
    }
    private function get_total_player()
    {
        $player = Player::all()->count('user_id');
        return $player;
    }
}