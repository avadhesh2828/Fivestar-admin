<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

# Models
use App\Models\PaymentHistoryTransaction;
use App\Models\Notification_model;
use App\Models\User;
use App\Models\Agent;
use App\Helpers\GenerateSignature;
use Auth;
use Validator;
use DB;
use Session;

class GameHistoryController extends Controller
{

    protected $childs = array();  
    protected $child_array = array();  

    public function __construct(){ }
      
    

    /**
     * Display a listing of the Game History
     *
     */
    public function game_history( Request $request ){
        $username = $request->post('username');
        $dates    = $request->post('dates');

        $validator = Validator::make($request->all(),[
        'username' => 'required|numeric',
        'dates'    => 'required'
        ]);

        if($validator->fails() ){
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'game_history',
                'message'=> 'Validation Failed',
                'global_error'=> $validator->errors(),
            ]);
        }
        
        $gameHistory = new PaymentHistoryTransaction;
        $gameHistory = $gameHistory->select('payment_history_transactions.*', 'U.username', DB::raw("(CASE WHEN payment_history_transactions.action = 'FiveStar Blessing' OR payment_history_transactions.action = 'SetScore' THEN payment_history_transactions.action ELSE NULL END) AS action"));
        $gameHistory = $gameHistory->with(['game_detail']);
        $gameHistory = $gameHistory->join((new User)->getTable().' as U', function($j){
            $j->on('U.user_id', '=', 'payment_history_transactions.user_id');
        });
    
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
            $gameHistory = $gameHistory->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }
    
        $gameHistory = $gameHistory->where('U.username', $username);
        $gameHistory = $gameHistory->orderBy('payment_history_transactions.payment_history_transaction_id', 'DESC');
        // Paginated records
        $gameHistory = $gameHistory->paginate($request->per_page);
    
        if($gameHistory->count() == 0){
          return response()->json([
            'response_code'=> 500,
            'service_name' => 'game_history',
            'data' => [],
            'message'=> 'No game history found',
            'global_error'=> 'No game history found',
          ]);
        }
    
        return response()->json([
          'response_code'=> 200,
          'service_name' => 'game_history',
          'data' => $gameHistory,
          'message'=> 'Game history found',
        ]);
    }

    /**
     * Display a listing of the Game Reports
     *
     */
    public function game_report( Request $request ){
      $player_id = $request->post('player_id');
      $game_type_id = $request->post('game_type_id');
      $dates    = $request->post('dates');

      $validator = Validator::make($request->all(),[
      'player_id'    => 'required',
      'game_type_id' => 'required',
      'dates'        => 'required'
      ]);

      if($validator->fails() ){
          return response()->json([
              'response_code'=> 400,
              'service_name' => 'game_report',
              'message'=> 'Validation Failed',
              'global_error'=> $validator->errors(),
          ]);
      }
      
      // $report = $this->playerReport($player_id, $game_type_id, $dates);
      // $totalFreeSpin = $this->sumRedpacket($player_id, $game_type_id, $dates);
      // $bet = $report->get()->sum('bet');
      // $win = $report->get()->sum('win');
      // $total_win = $bet - $win;
      // // Paginated records
      // $report = $report->paginate($request->per_page);
  
      // if($report->count() == 0){
      //   return response()->json([
      //     'response_code' => 500,
      //     'service_name'  => 'game_report',
      //     'bet'           => $bet,
      //     'win'           => $win,
      //     // 'total_win'     => $total_win,
      //     'total_free_spin' => $totalFreeSpin,
      //     'data'          => [],
      //     'message'       => 'No reports found',
      //     'global_error'  => 'No reports found',
      //   ]);
      // }
  
      // return response()->json([
      //   'response_code' => 200,
      //   'service_name'  => 'game_report',
      //   'bet'           => $bet,
      //   'win'           => $win,
      //   // 'total_win'     => $total_win,
      //   'total_free_spin' => $totalFreeSpin,
      //   'data'          => $report,
      //   'message'       => 'Reports found',
      // ]);



      // $report = $this->playerReport($player_id, $game_type_id, $dates);
      // $totalFreeSpin = $this->sumRedpacket($player_id, $game_type_id, $dates);
      
      // return response()->json([
      //   'response_code' => 200,
      //   'service_name'  => 'game_report',
      //   'total_free_spin' => $totalFreeSpin,
      //   'data'          => $report[0],
      //   'message'       => 'Reports found',
      // ]);


      $report = $this->playerReport($player_id, $game_type_id, $dates);
      $totalFreeSpin = $this->sumRedpacket($player_id, $game_type_id, $dates);
      $bet = $report->get()->sum('bet');
      $win = $report->get()->sum('win');
      $total_win = $bet - $win;
      // Paginated records
      $report = $report->get();
  
      if($report->count() > 0){
        foreach($report as $key) {
            $redpacket = $this->getSumOfPlayerRedpacket($player_id, $game_type_id, $key->created_at);
            $key['redpacket'] = $redpacket;
            $reports[] = $key;
        }

        return response()->json([
          'response_code'   => 200,
          'service_name'    => 'game_report',
          'bet'             => $bet,
          'win'             => $win,
          // 'total_win'    => $total_win,
          'total_free_spin' => $totalFreeSpin,
          'data'            => $reports,
          'message'         => 'Reports found',
        ]);

      }
  
      return response()->json([
        'response_code'   => 500,
        'service_name'    => 'game_report',
        'bet'             => $bet,
        'win'             => $win,
        // 'total_win'    => $total_win,
        'total_free_spin' => $totalFreeSpin,
        'data'            => [],
        'message'         => 'No reports found',
        'global_error'    => 'No reports found',
      ]);      


    }

    private function playerReport($player_id, $game_type_id, $dates)
    {
        $report = new PaymentHistoryTransaction;
        $report = $report->select(DB::raw('DATE(payment_history_transactions.created_at) as created_at'), DB::raw("SUM(payment_history_transactions.bet) as bet") , DB::raw("SUM(payment_history_transactions.win) as win"));

        // $report = $report->select( DB::raw("SUM(payment_history_transactions.bet) as bet") , DB::raw("SUM(payment_history_transactions.win) as win"));
        $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
      
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
          $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }
        $report = $report->where('payment_history_transactions.user_id', $player_id);
        if($game_type_id == '1') {
          $report = $report->where('game.game_type_id', 6);
          $report = $report->whereNotNull('payment_history_transactions.table_id');
        }
        $report = $report->where('payment_history_transactions.game_id', '!=', 0);
        $report = $report->where('payment_history_transactions.free_game', '=', 0);

        $report = $report->groupBy(DB::raw('DATE(payment_history_transactions.created_at)'));
        return $report = $report->orderBy('created_at', 'DESC');

        // return $report = $report->get();
    }

    private function sumRedpacket($player_id, $game_type_id, $dates)
    {
        $report = new PaymentHistoryTransaction;
        $report = $report->select(DB::raw("SUM(payment_history_transactions.win) as win"));
        $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
      
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
          $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }
        $report = $report->where('payment_history_transactions.user_id', $player_id);
        if($game_type_id == '1') {
          $report = $report->where('game.game_type_id', 6);
          $report = $report->whereNotNull('payment_history_transactions.table_id');
        }
        $report = $report->where('payment_history_transactions.game_id', '!=', 0);
        $report = $report->where('payment_history_transactions.free_game', '=', 1);
        // $report = $report->groupBy(DB::raw('DATE(payment_history_transactions.created_at)'));
        // $report = $report->orderBy('created_at', 'DESC');
        $report = $report->get()->sum('win');
        return $report;
    }


    private function getSumOfPlayerRedpacket($player_id, $game_type_id, $created_date)
    {
        $report = new PaymentHistoryTransaction;
        $report = $report->select(DB::raw("SUM(payment_history_transactions.win) as win"));
        $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
        $report = $report->where('payment_history_transactions.created_date', $created_date);
        $report = $report->where('payment_history_transactions.user_id', $player_id);
        if($game_type_id == '1') {
          $report = $report->where('game.game_type_id', 6);
          $report = $report->whereNotNull('payment_history_transactions.table_id');
        }
        $report = $report->where('payment_history_transactions.game_id', '!=', 0);
        $report = $report->where('payment_history_transactions.free_game', '=', 1);
        $report = $report->get()->sum('win');
        return $report;
    }


    /**
     * Display a listing of the Agent Game Reports
     *
     */
    public function agent_game_report( Request $request ){
        $this->user = Auth::user();
        $agent_id = $request->post('agent_id');
        $game_type_id = $request->post('game_type_id');
        $dates    = $request->post('dates');

        $validator = Validator::make($request->all(),[
        'agent_id'     => 'required',
        'game_type_id' => 'required',
        'dates'        => 'required'
        ]);

        if($validator->fails() ){
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'agent_game_report',
                'message'=> 'Validation Failed',
                'global_error'=> $validator->errors(),
            ]);
        }

        $agentIds = $this->get_child($agent_id);
        $report = $this->get_agent_report($agentIds, $game_type_id, $dates);
        $bet = $report->get()->sum('bet');
        $win = $report->get()->sum('win');
        $total_win = $bet - $win;
      
        // Paginated records
        $report = $report->paginate($request->per_page);
        if($report->count() == 0){
          return response()->json([
            'response_code'=> 500,
            'service_name' => 'agent_game_report',
            'bet'          => $bet,
            'win'          => $win,
            'total_win'    => $total_win,
            'data'         => [],
            'message'      => 'No reports found',
            'global_error' => 'No reports found',
          ]);
        }
        return response()->json([
          'response_code'=> 200,
          'service_name' => 'agent_game_report',
          'bet'          => $bet,
          'win'          => $win,
          'total_win'    => $total_win,
          'data'         => $report,
          'message'      => 'Reports found',
        ]);
    }


    /**
     * get child agent
     */
    private function get_child($adminId) {
      $agents = Agent::with('children')->where('parent_id', $adminId)->get();
        if(count($agents) > 0) {
            $tree=array($adminId);
            foreach($agents as $key) {
              $idArr = $this->children($key->children);
              if(count($idArr) > 0) {
                $tree=array_merge($tree,$idArr);  
              }
              $ids[] = $key->admin_id; 
              $tree=array_merge($tree,$ids);
            }
            return $tree; 
        } else {
          
          return  $agents = Agent::where('admin_id', $adminId)->pluck('admin_id');

        }    
    }

    /**
     * recursive
     */
    private function children($childArray)
    {
        if(count($childArray) > 0) {
            foreach($childArray as $value) {
              $ids = $value->admin_id; 
              array_push($this->childs, $ids); 
              $this->children($value->children);
            } 
            return $this->childs;
        } else {
          return [];
        }
    
    }


    private function get_agent_report($agentIds, $game_type_id, $dates)
    {
        $report = new User;
        $report = $report->select('payment_history_transactions.created_date', DB::raw("SUM(payment_history_transactions.bet) as bet"), DB::raw("SUM(payment_history_transactions.win) as win"));
        $report = $report->join('finanace.payment_history_transactions', 'user.user_id', '=', 'payment_history_transactions.user_id');
        $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
      
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
          $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }

        $report = $report->whereIn('user.parent_id', $agentIds);
        if($game_type_id == '1') {
          $report = $report->where('game.game_type_id', 6);
          $report = $report->whereNotNull('payment_history_transactions.table_id');
        }
        $report = $report->where('payment_history_transactions.action', '!=', 'SetScore');
        $report = $report->groupBy('payment_history_transactions.created_date');
        $report = $report->orderBy('payment_history_transactions.created_date','DESC');
        return $report = $report;
    }


     /**
     * Display a listing of the Agent Game Reports
     *
     */
    public function all_agent_report( Request $request )
    {
        $this->user = Auth::user();
        $agent_id = $request->post('agent_id');
        $game_type_id = $request->post('game_type_id');
        $dates    = $request->post('dates');

        $validator = Validator::make($request->all(),[
        'agent_id'     => 'required',
        'game_type_id' => 'required',
        'dates'        => 'required'
        ]);

        if($validator->fails() ){
            return response()->json([
                'response_code'=> 400,
                'service_name' => 'all_agent_report',
                'message'=> 'Validation Failed',
                'global_error'=> $validator->errors(),
            ]);
        }

        $agents = Agent::select('admin_id','username','parent_id','name','phone','description');
        $agents = $agents->where('parent_id', $agent_id);
        $agents = $agents->get();
        if(count($agents) > 0 ) {
          $report = array();
          $twin = 0;
          $tbet = 0;
          foreach($agents as $key) {

              $childIds = $this->get_agent_child($key->admin_id);
              $res = $this->get_all_agent_report($childIds, $game_type_id, $dates);
              $result = $res->get();

              $bet = $result->sum('bet');
              $win = $result->sum('win');
      
              if($bet > 0 || $win > 0) {
                $report[] = array(
                    'admin_id'    => $key->admin_id,
                    'username'    => $key->username,
                    'name'        => $key->name,
                    'phone'       => $key->phone,
                    'description' => $key->description,
                    'bet'         => $bet,
                    'win'         => $win
                );
                $twin += $win;
                $tbet += $bet;
              }
         }
         $data = array(
            'total_win' => $tbet - $twin,
            'data'      => $report
          );
          // return $data;  
          return response()->json([
            'response_code'=> 200,
            'service_name' => 'all_agent_report',
            'data'         => $data,
            'message'      => 'Reports found',
          ]);
        } else {
          return response()->json([
            'response_code'=> 500,
            'service_name' => 'all_agent_report',
            'data'         => [],
            'message'      => 'No reports found',
            'global_error' => 'No reports found',
          ]);
        }

        
    }

    /**
     * get child agent
     */
    private function get_agent_child($adminId) {
      $agents = Agent::with('children')->where('parent_id', $adminId)->get();
        if(count($agents) > 0) {
            $tree=array($adminId);
            foreach($agents as $key) {
              $idArr = $this->Child($key->children);
              if(count($idArr) > 0) {
                $tree=array_merge($tree,$idArr);  
              }
              $ids[] = $key->admin_id; 
              $tree=array_merge($tree,$ids);
            }
            return $tree; 
        } else {          
          return  $agents = Agent::where('admin_id', $adminId)->pluck('admin_id');
        }    
    }

    /**
     * recursive
     */
    private function Child($childArray)
    {
        if(count($childArray) > 0) {
            foreach($childArray as $value) {
              $child_id = $value->admin_id; 
              array_push($this->child_array, $child_id); 
              $this->Child($value->children);
               
            } 
            return $this->child_array;
        } else {
          return [];
        }
    
    }

    private function get_all_agent_report($agentIds, $game_type_id, $dates)
    {
        $report = new User;
        $report = $report->select(DB::raw("SUM(payment_history_transactions.bet) as bet"), DB::raw("SUM(payment_history_transactions.win) as win"));
        $report = $report->join('finanace.payment_history_transactions', 'user.user_id', '=', 'payment_history_transactions.user_id');
        $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
        $report = $report->join('users.admins', 'admins.admin_id', '=', 'user.parent_id');
      
        // Date Range Filter
        if( isset($dates['fromdate']) && isset($dates['todate']) ){
          $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
        }
        // $report = $report->where('user.parent_id', $agentIds);
        $report = $report->whereIn('user.parent_id', $agentIds);
        if($game_type_id == '1') {
          $report = $report->where('game.game_type_id', 6);
          $report = $report->whereNotNull('payment_history_transactions.table_id');
        }
        $report = $report->where('payment_history_transactions.action', '!=', 'SetScore');
        return $report = $report;
    }

  /**
   * KA game recall
   */
  public function ka_recall(Request $request) {
      $transactionId = $request->post('transactionId');
      $game_id = $request->post('game_id');

      $validator = Validator::make($request->all(),[
        'transactionId' => 'required',
        'game_id'       => 'required'
      ]);

      if($validator->fails() ){
          return response()->json([
              'response_code'=> 400,
              'service_name' => 'ka_recall',
              'message'=> 'Validation Failed',
              'global_error'=> $validator->errors(),
          ]);
      }
      $epochSeconds  =  time();
      $secretKey     = '4651DFDFC7F0EE9BA04EBC0D767BFD13';
      $hash =  hash_hmac('SHA256', $transactionId . $epochSeconds, $secretKey);

      $urls = 'https://gamessea.kaga88.com/?g='.$game_id.'&ak=3AA53FCC197FE1BC041D648782C060BF&p=FIVESTAR&grid='.$transactionId.'&grha='.$hash.'&grts='.$epochSeconds;

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'ka_recall',
        'data' => $urls,
        'message'=> 'KaS recall found',
      ]);

  } 

  /**
   * Dragoon game recall
   */
  public function dragoon_recall(Request $request) {
      $transactionId = $request->post('transactionId');
      $game_id = $request->post('game_id');
      $round = $request->post('round');

      $validator = Validator::make($request->all(),[
        'transactionId' => 'required',
        'game_id'       => 'required',
        'round'         => 'required'
      ]);

      if($validator->fails() ){
          return response()->json([
              'response_code'=> 400,
              'service_name' => 'dragoon_recall',
              'message'=> 'Validation Failed',
              'global_error'=> $validator->errors(),
          ]);
      }

      $data = json_encode(array(
        "channel"     => env('DRAGOON_CHANNEL'),
        "game_id"     => $game_id,
        "game_serial" => $transactionId,
        "round_id"    => (string)$round,
        "lang"        => "en_us"
      ));
  
      $URL = env('DRAGOON_API_URL').'record/get_bet_detail_page';
      $result = $this->postCurl($URL, $data);
      $data = json_decode($result); 
      
      $urls = $data->url;

      return response()->json([
        'response_code'=> 200,
        'service_name' => 'dragoon_recall',
        'data' => $urls,
        'message'=> 'Dragoon recall found',
      ]);
  } 

  /**
   * POST CURL for Game
   */
  private function postCurl($URL, $data) {
          
    // Generate X-Ds-X_Ds_Signature
    $X_Ds_Signature = GenerateSignature::AutoGenerateSignature($data);
    
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $URL,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => $data,
        CURLOPT_HTTPHEADER => array(
            "Content-Type: application/json",
            "Cookie: __cfduid=d825410a64270b3bde9d3b30e3ec705961604303179",
            "X-Ds-Signature: " .$X_Ds_Signature,
        ),
    ));

    $response = curl_exec($curl);
    $err      = curl_error($curl);
    curl_close($curl);
    if ($err) {
        // echo "cURL Error #:" . $err;
        return $err;
    } else {
        return $response;
    }     
  }

  /**
   * Display a listing of the player redpacket
   */
  public function player_redpacket(Request $request)
  {
      $this->user = Auth::user();
      $username = $request->post('username');
      $dates    = $request->post('dates');

      $validator = Validator::make($request->all(),[
      'username' => 'required',
      'dates'    => 'required'
      ]);

      if($validator->fails() ){
          return response()->json([
              'response_code'=> 400,
              'service_name' => 'player_redpacket',
              'message'=> 'Validation Failed',
              'global_error'=> $validator->errors(),
          ]);
      }

      $redpacket_report = new PaymentHistoryTransaction;
      $redpacket_report = $redpacket_report->select(DB::raw("SUM(payment_history_transactions.win) as win"));
      $redpacket_report = $redpacket_report->join((new User)->getTable().' as U', function($j){
          $j->on('U.user_id', '=', 'payment_history_transactions.user_id');
      });
  
      // Date Range Filter
      if( isset($dates['fromdate']) && isset($dates['todate']) ){
          $redpacket_report = $redpacket_report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
      }
  
      if($username > 0) {
        $redpacket_report = $redpacket_report->where('U.username', $username);
      }
      $redpacket_report = $redpacket_report->where('payment_history_transactions.action', 'FiveStar Blessing');
      // Paginated records
      $redpacket_report = $redpacket_report->paginate($request->per_page);
  
      if($redpacket_report->count() == 0){
        return response()->json([
          'response_code'=> 500,
          'service_name' => 'player_redpacket',
          'data'         => [],
          'message'      => 'No reports found',
          'global_error' => 'No reports found',
        ]);
      }
      return response()->json([
        'response_code'=> 200,
        'service_name' => 'player_redpacket',
        'data'         => $redpacket_report,
        'message'      => 'Reports found',
      ]);
  }


  /**
   * Display a listing of the Game Reports
   *
   */
  public function get_all_player_report( Request $request ){
      $agent_id = $request->post('agent_id');
      $dates    = $request->post('dates');
      $game_type_id = $request->post('game_type_id');

      $validator = Validator::make($request->all(),[
      'agent_id'     => 'required',
      'game_type_id' => 'required',
      'dates'        => 'required'
      ]);

      if($validator->fails() ){
          return response()->json([
              'response_code'=> 400,
              'service_name' => 'get_all_player_report',
              'message'=> 'Validation Failed',
              'global_error'=> $validator->errors(),
          ],400);
      }

      
      $report = new PaymentHistoryTransaction;
      $report = $report->select('user.user_id', 'user.username', DB::raw("SUM(payment_history_transactions.bet) as bet") , DB::raw("SUM(payment_history_transactions.win) as win"));

      $report = $report->join('users.user', 'user.user_id', '=', 'payment_history_transactions.user_id');

      $report = $report->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
    
      // Date Range Filter
      if( isset($dates['fromdate']) && isset($dates['todate']) ){
        $report = $report->whereBetween('payment_history_transactions.created_at', [$dates['fromdate'] , $dates['todate']]);
      }
      $report = $report->where('user.parent_id', $agent_id);
      if($game_type_id == '1') {
        $report = $report->where('game.game_type_id', 6);
        $report = $report->whereNotNull('payment_history_transactions.table_id');
      }
      $report = $report->where('payment_history_transactions.game_id', '!=', 0);
      $report = $report->where('payment_history_transactions.free_game', '=', 0);

      $report = $report->groupBy('user.user_id','user.username');

      $report = $report->get();

      if($report->count() > 0){
        foreach($report as $key) {
          $free_game = new PaymentHistoryTransaction;
          $free_game = $free_game->select(DB::raw("SUM(payment_history_transactions.win) as win"));
          $free_game = $free_game->join('game.game', 'game.game_id', '=', 'payment_history_transactions.game_id');
          $free_game = $free_game->where('payment_history_transactions.user_id', $key->user_id);
          if($game_type_id == '1') {
            $free_game = $free_game->where('game.game_type_id', 6);
            $free_game = $free_game->whereNotNull('payment_history_transactions.table_id');
          }
          $free_game = $free_game->where('payment_history_transactions.game_id', '!=', 0);
          $free_game = $free_game->where('payment_history_transactions.free_game', '=', 1);
          $free_game = $free_game->get()->sum('win');
        
          $key['free_game'] = $free_game;
          $reports[] = $key;
        }

        return response()->json([
          'response_code'   => 200,
          'service_name'    => 'get_all_player_report',
          'data'            => $reports,
          'message'         => 'Reports found',
        ]);
      } else {
        return response()->json([
          'response_code'   => 500,
          'service_name'    => 'get_all_player_report',
          'data'            => [],
          'message'         => 'No reports found',
          'global_error'    => 'No reports found',
        ]);     
      }  
      
    }


}