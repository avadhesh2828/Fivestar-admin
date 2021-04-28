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
        $data['total_agent'] = $this->get_total_agent($this->user);
        $data['total_player'] = $this->get_total_player($this->user);
        $data['active_agent'] = $this->get_active_agent($this->user);
        $data['inactive_agent'] = $this->get_inactive_agent($this->user);
        $data['active_player'] = $this->get_active_player($this->user);
        $data['inactive_player'] = $this->get_inactive_player($this->user);
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
            $agent = Agent::where('parent_id', $user->admin_id)->count();    

        } else {
            $agent = Agent::all()->count();    
        }
        return $agent;
    }
    private function get_total_player($user)
    {
        if($user->parent_id > 0) {
            $player = User::where('parent_id', $user->admin_id)->count();    

        } else {
            $player = User::all()->count();    
        }
        return $player;
    }

    private function get_active_agent($user)
    {
        if($user->parent_id > 0) {
            $player = Agent::where(['parent_id' => $user->admin_id, 'status' => 1 ])->count();    

        } else {
            $player = Agent::where('status', 1)->count();    
        }
        return $player;
    }

    private function get_inactive_agent($user)
    {
        if($user->parent_id > 0) {
            $player = Agent::where(['parent_id' => $user->admin_id, 'status' => 0 ])->count();    

        } else {
            $player = Agent::where('status', 0)->count();    
        }
        return $player;
    }

    private function get_active_player($user)
    {
        if($user->parent_id > 0) {
            $player = User::where(['parent_id' => $user->admin_id, 'status' => 1 ])->count();    

        } else {
            $player = User::where('status', 1)->count();    
        }
        return $player;
    }

    private function get_inactive_player($user)
    {
        if($user->parent_id > 0) {
            $player = User::where(['parent_id' => $user->admin_id, 'status' => 0 ])->count();    

        } else {
            $player = User::where('status', 0)->count();    
        }
        return $player;
    }
}