<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
// Route::group(['prefix' => 'dashboard'], function(){
// 	Route::post('get_all_stats', 'DashboardController@get_all_stats');
// });

Route::post('login', 'AdminController@login');
Route::post('verify-personal-password', 'AdminController@verify_personal_password');
Route::post('set-personal-password', 'AdminController@set_personal_password');
Route::get('user/export-pdf','UserController@export_pdf');
Route::get('user/export-excel','UserController@export_excel');
Route::middleware('auth:api')->group(function () {
	//change password
	Route::post('change-password', 'AdminController@change_password');
	Route::post('change-security-password', 'AdminController@change_security_password');
	Route::get('get-details', 'AdminController@get_details');
	Route::get('category', 'CommonController@get_category');

	//dashboard
	Route::group(['prefix' => 'dashboard'], function(){
		Route::post('get_all_stats', 'DashboardController@get_all_stats');
	});


	//agent
	Route::group(['prefix' => 'agent'], function(){
		Route::get('list', 'AgentController@index');
		Route::post('create', 'AgentController@create');
		Route::post('change-agent-status/{agent_id}', 'AgentController@change_agent_status');
		Route::get('get-agent-details/{agentId}', 'AgentController@get_agent_details');
		Route::post('set-score', 'AgentController@set_score');
		Route::post('update-agent', 'AgentController@update_agent');
	});	

	//User
	Route::group(['prefix' => 'users'], function(){
		Route::get('list', 'UserController@index');
		Route::post('create', 'UserController@create');
		Route::post('change-user-status/{user_id}', 'UserController@change_user_status');
		Route::post('get-login-history', 'UserController@get_login_history');
		Route::post('search-user', 'UserController@search_user');
		Route::get('get-user-details/{userId}', 'UserController@get_user_details');
		Route::post('set-score', 'UserController@set_score');
		Route::post('update-user', 'UserController@update_user');
		Route::get('fetch-player-username', 'UserController@generate_unique_username');
	});

	//red packet
	Route::group(['prefix' => 'red-packet'], function(){
		Route::get('list','RedPacketController@index')->middleware('can:isAdmin');
		Route::post('create','RedPacketController@create')->middleware('can:isAdmin');
		Route::post('change-status/{redPacketId}','RedPacketController@change_status')->middleware('can:isAdmin');
	});

	//jackpot
	Route::group(['prefix' => 'jackpot'], function(){
		Route::get('list','JackpotController@index')->middleware('can:isAdmin');
		Route::post('update','JackpotController@update')->middleware('can:isAdmin');
	});

	//advertisment route
	Route::group(['prefix' => 'advertisements'], function(){
		Route::get('get_advertisement','Advertisements@get_advertisement')->middleware('can:isAdmin');
		Route::post('create_advertisement','Advertisements@create_ads')->middleware('can:isAdmin');
		Route::post('get_positions','Advertisements@get_positions')->middleware('can:isAdmin');
		Route::post('do_upload','Advertisements@do_upload')->middleware('can:isAdmin');
		Route::post('change_adv_status','Advertisements@change_adv_status')->middleware('can:isAdmin');
		Route::post('delete_advertisement','Advertisements@delete_advertisement')->middleware('can:isAdmin');
	});	

	//notificaton
	Route::group(['prefix' => 'notifications'], function(){
		Route::post('add_new_notification','NotificationController@add_new_notification')->middleware('can:isAdmin');
		Route::post('get_all_notifications','NotificationController@get_all_notifications')->middleware('can:isAdmin');
		Route::post('fcm_notifications','NotificationController@fcm_notifications')->middleware('can:isAdmin');
	});
	
	
	//game 
	Route::group(['prefix' => 'game'], function(){
		Route::get('categories', 'GameController@get_categories');
		Route::get('provider', 'GameController@get_provider');
		Route::get('list','GameController@index')->middleware('can:isAdmin');
		Route::post('change-game-status/{game_id}', 'GameController@change_game_status')->middleware('can:isAdmin');
		Route::post('change-featured/{game_id}', 'GameController@change_featured')->middleware('can:isAdmin');
		Route::get('get-game-details/{gameId}', 'GameController@get_game_details')->middleware('can:isAdmin');
		Route::post('change-position/{game_id}', 'GameController@change_position')->middleware('can:isAdmin');
	});


	// Payment Withdrawl Routes
	Route::group(['prefix' => 'finance'], function(){
		Route::post('score-log', 'Finance\DepositController@score_logs');
		Route::get('transaction-history', 'Finance\WithdrawController@transaction_history');
		Route::post('game-history', 'Finance\GameHistoryController@game_history');
		Route::post('game-report', 'Finance\GameHistoryController@game_report');

		Route::get('deposit-list', 'Finance\DepositController@deposit_list');
		Route::get('withdraw-list', 'Finance\WithdrawController@withdraw_list');
		Route::post('manage-withdraw-status', 'Finance\WithdrawController@manage_status');
	});


	//route match api
	Route::group(['prefix' => 'season'], function()
	{
		Route::get('get_all_season_schedule','MatchController@get_all_season_schedule');
		Route::post('get_all_league','MatchController@get_all_league');
		Route::post('get_all_team','MatchController@get_all_team');
		Route::post('get_all_week','MatchController@get_all_week');
        Route::get('get_match_players','MatchController@get_match_players');
        Route::get('get_all_seasons','MatchController@get_all_seasons');
	});
    Route::post('match/create_match','MatchController@create_match');
	Route::post('match/match_details','MatchController@match_details');
	Route::post('match/edit-match-details','MatchController@edit_match_details');
	Route::post('match/update-match','MatchController@update_match');
	Route::post('match/delete-match','MatchController@delete_match');
	Route::post('match/get-weight-classes','MatchController@get_weight_classes');
	Route::post('match/get-news-list','MatchController@get_news_list');
	Route::post('match/add-fight-result','MatchController@add_fight_result');
	//common api
	Route::group(['prefix' => 'common'], function()
	{
		Route::post('country_list','CommonController@country_list');
		Route::get('get-leagues', 'CommonController@get_leagues');
		Route::get('get-game-styles/{season_id}', 'CommonController@get_game_styles');
		Route::get('get-league/{league_id}', 'CommonController@get_league');
		Route::get('get-game-style/{season_id}', 'CommonController@get_game_style');
        Route::get('get-sizes/{league}/{gameStyle}', 'CommonController@get_sizes');
        Route::get('combat_types', 'CommonController@combat_types');
		Route::post('promotion_list','CommonController@promotion_list');
		Route::post('event_list', 'CommonController@get_event_list');
		Route::post('game_style_list', 'CommonController@get_game_style_list');
		Route::post('victory-type', 'CommonController@victory_type_list');

	});

	
	//payment transaction
	Route::post('payment_transaction/get_all_transaction','Payment_transaction@get_all_transaction');
	//dispute route
	Route::get('disputes','DisputeController@get_all_disputes');
	Route::post('dispute/change_dispute_status','DisputeController@change_dispute_status');
	Route::post('dispute/get_dispute_detail','DisputeController@get_dispute_detail');


	//players api
	Route::get('player/get_all_players','PlayerController@get_all_players');
	Route::get('player/players-list','PlayerController@player_list');
	Route::post('player/get-player-status','PlayerController@fighter_status');
	Route::post('player/get_all_teams','PlayerController@get_all_teams');
	Route::post('player/get_all_positions','PlayerController@get_all_positions');
	Route::post('player/get_player_details','PlayerController@get_player_details');
	Route::post('player/update_player_status','PlayerController@update_player_status');
    Route::post('player/update_player','PlayerController@update_player');
    Route::post('player/do_upload','PlayerController@do_upload');
	Route::post('player/create_player','PlayerController@create_player');
	Route::post('player/edit-update-player','PlayerController@edit_update_player');
	Route::post('player/delete-player','PlayerController@delete_player');

	//get all leagues api
	Route::post('player/get_all_leagues','PlayerController@get_all_leagues');
	//get all seaons accrding to league id
	Route::post('player/get_all_seasons','PlayerController@get_all_seasons');
	Route::post('player/get_all_seasons_year','PlayerController@get_all_seasons_year');

	//teams route
	Route::get('team/get_all_teams','TeamsController@get_all_teams');
	Route::post('team/pre_team_data','TeamsController@pre_team_data');
	Route::post('team/match_details','TeamsController@match_details');

	//admin logout route
	Route::post('logout','AdminController@logout');

	

	// Contest Routes
	Route::group(['prefix' => 'contest', 'namespace' => 'Contest'], function(){
        Route::get('get-matches', 'ContestController@get_tournaments');
        //create-contest
        Route::post('create-contest', 'ContestController@create_contest');

		Route::group(['prefix' => 'golf'], function(){
			//Golf Contest Routes
			Route::get('get-tournaments', 'GolfController@get_tournaments');
			Route::post('create-championship', 'GolfController@create_championship');
		});

		Route::get('get-prizes', 'ContestController@get_prizes');
		Route::get('pre-data', 'ContestController@pre_data');
		Route::get('get-match-weeks/{season_id}/{game_style_id}', 'ContestController@get_match_weeks');
		Route::get('list', 'ContestController@index');
		Route::get('detail/{contestUId}', 'ContestController@show');
		Route::get('leaderboard/{contestId}', 'ContestController@contest_leaderboard');
		Route::post('update-contest/','ContestController@update_contest');
		Route::post('update-prediction/','ContestController@update_prediction');
        Route::post('delete-contest','ContestController@delete_contest');
		Route::post('contest-complete','ContestWinningController@complete_contest');
		Route::post('contest-cancelled','ContestCancellationController@index');
		Route::post('contest-fighter-pic', 'ContestController@contest_fighter_pic');
	});
	//News api
	Route::get('news/get_all_news','NewsController@get_all_news');
	Route::post('news/create_news','NewsController@create_news');
	Route::post('news/do_upload','NewsController@do_upload');
	Route::post('news/delete_news','NewsController@delete_news');
	Route::post('news/get_news_by_id/','NewsController@get_news_by_id');
	Route::post('news/update_news/','NewsController@update_news');

	//Events api
	Route::get('events/list','EventController@list');
	Route::get('events/get-matches','EventController@get_tournaments');
	Route::post('events/create-event','EventController@create_event');
	Route::post('events/get_event_by_id/','EventController@get_event_by_id');
	Route::post('events/update-event/','EventController@update_event');
	Route::post('events/delete-event/','EventController@delete_event');

	//promotions api
	Route::get('promotion-list','PromotionController@list');
	Route::post('promotion-delete','PromotionController@delete_promotion');
	Route::post('promotion-update','PromotionController@update');
	Route::post('promotion-create','PromotionController@create_promotion');

	//weightclass
	Route::group(['prefix' => 'weightclass'], function(){
		//Golf Contest Routes
		Route::get('list', 'WeightclassController@index');
		Route::post('create', 'WeightclassController@create');
		Route::post('update', 'WeightclassController@update');
		Route::post('delete', 'WeightclassController@destroy');
	});

	//page content api
	Route::get('pages-list','PageController@index');
	Route::post('pages-list/edit','PageController@edit');
	Route::post('pages-list/update','PageController@update');
});
