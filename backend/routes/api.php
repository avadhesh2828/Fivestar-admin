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
		Route::post('update-red-packet/{redPacketId}','RedPacketController@update_red_packet')->middleware('can:isAdmin');
		Route::get('red-packet-category','RedPacketController@red_packet_category')->middleware('can:isAdmin');
		Route::post('update-category-time','RedPacketController@update_category_time')->middleware('can:isAdmin');
		Route::post('delete-red-packet','RedPacketController@delete_red_packet')->middleware('can:isAdmin');
		
	});

	//jackpot
	Route::group(['prefix' => 'jackpot'], function(){
		Route::get('list','JackpotController@index')->middleware('can:isAdmin');
		Route::post('update','JackpotController@update')->middleware('can:isAdmin');
	});

	 // suggestion Routes
	 Route::group(['prefix' => 'suggestion'], function(){
		Route::get('list', 'SuggestionController@index');
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
		Route::post('agent-game-report', 'Finance\GameHistoryController@agent_game_report');
		Route::post('all-agent-report', 'Finance\GameHistoryController@all_agent_report');
		Route::post('ka-recall', 'Finance\GameHistoryController@ka_recall');
		Route::post('dragoon-recall', 'Finance\GameHistoryController@dragoon_recall');
		Route::get('deposit-list', 'Finance\DepositController@deposit_list');
		Route::get('withdraw-list', 'Finance\WithdrawController@withdraw_list');
		Route::post('manage-withdraw-status', 'Finance\WithdrawController@manage_status');
	});

	//common api
	Route::get('category', 'CommonController@get_category');

	//admin logout route
	Route::post('logout','AdminController@logout');

});
