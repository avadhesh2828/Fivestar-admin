<?php

namespace App\Helpers;

# Helpers & Libraries
use PayPal\Api\Payout;
use PayPal\Api\PayoutSenderBatchHeader;
use PayPal\Api\PayoutItem;
use PayPal\Api\Currency;
use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;
use Config;

class Paypal{

  private static function initialize_paypal(){
  
    $clientId = Config::get('constants.PAYPAL_CLIENT_ID');
    $clientSecret = Config::get('constants.PAYPAL_CLIENT_SECRET');
    $paypalMode = Config::get('constants.PAYPAL_MODE');
  
    $apiContext = new ApiContext(
      new OAuthTokenCredential(
        $clientId,     // ClientID
        $clientSecret      // ClientSecret
      )
    );

    if($paypalMode == 'production'){
      $apiContext->setConfig([
        'mode' => 'live',
      ]);
    }

    return $apiContext;
  }
  
  public static function send_payout($currency, $amount, $type, $value)
  {
    $apiContext = self::initialize_paypal();
    try {
      $payouts = new Payout();
  
      $senderBatchHeader = new PayoutSenderBatchHeader();
      $senderBatchHeader->setSenderBatchId(uniqid())
      ->setEmailSubject("You have a Payout of $currency $amount from Draft Now");
      //->setMessage("Your Withdrawl request has been approved by the admin. Please check your PayPal Account for furthure details.");
  
      $senderItem = new PayoutItem();
      $senderItem->setRecipientType($type)
      ->setNote('Thanks for using Draft Now')
      ->setReceiver($value)
      ->setAmount(new Currency('{
        "value":"'.$amount.'",
        "currency":"'.$currency.'"
      }'));
  
      $payouts->setSenderBatchHeader($senderBatchHeader)
      ->addItem($senderItem);
      
      $request = clone $payouts;
      $transaction = $payouts->create(array('sync_mode' => 'false'), $apiContext);//$payouts->createSynchronous($apiContext);
      return $transaction->getBatchHeader();
      
    } catch (\Exception $ex) {
      // log_message('error',
      // "Body: ".$ex->getMessage());
      return FALSE;
    }
  }
  
  public static function get_payout_status($payout_batch_id){
 
    $apiContext = initialize_paypal();
  
    try {
      $transaction = Payout::get($payout_batch_id, $apiContext);
      print_r($transaction->items[0]);die;
      return $transaction->items[0];
      
    } catch (Exception $ex) {
      log_message('error',
      "Body: ".$ex->getMessage());
      return FALSE;
    }
  }
}