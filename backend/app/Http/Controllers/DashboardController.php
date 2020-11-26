<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Agent;
use App\Models\PaymentHistoryTransaction;
use App\Models\User;
use App\Models\Player;
use Auth;
use DB;

class DashboardController extends Controller
{
    public function get_all_stats(Request $request)
    {
        $this->user = Auth::user();
        $data['total_user_available_balance'] = $this->get_total_user_balance();
        $data['total_deposit_amount'] = $this->get_total_deposited_amount();
        $data['total_withdraw_amount'] = $this->get_total_withdraw_amount();
        $data['total_winning_amount'] = $this->get_total_winning_amount();
        $data['total_agent'] = $this->get_total_agent($this->user);
        $data['total_player'] = $this->get_total_player($this->user);
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

    private function get_total_agent($user)
    {
        if($user->parent_id > 0) {
            $agent = Agent::where('parent_id', $user->parent_id)->count();    

        } else {
            $agent = Agent::all()->count();    
        }
        return $agent;
    }
    private function get_total_player($user)
    {
        if($user->parent_id > 0) {
            $player = User::where('parent_id', $user->parent_id)->count();    

        } else {
            $player = User::all()->count();    
        }
        return $player;
    }
}