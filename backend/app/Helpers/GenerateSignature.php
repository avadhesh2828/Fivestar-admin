<?php

namespace App\Helpers;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Storage;

class GenerateSignature
{

  //dragoon key generate
	public static function AutoGenerateSignature($data)
	{
        // $data = '{"channel": "54330424"}';
        // import your private key
        $privateKeyId = openssl_pkey_get_private(file_get_contents('../private.pem'));

        // sign date with your private key
        openssl_sign($data, $signature, $privateKeyId, 'RSA-SHA256');
        // encode into base64
        $ds_sign = base64_encode($signature);
        // you may free up memory after, but I wouldn't recommend, since you are going to make many requests and sign each of them.
        // importing key from file each time isn't brightest idea
        openssl_free_key($privateKeyId);

        // echo "signature: \n" . $ds_sign . "\n";

        // importing public key
        $ds_pub_key = openssl_pkey_get_public(file_get_contents('../public.pub'));
        // verifying signature for $data and imported public key
        // note that signature firstly was decoded from base64
        $valid = openssl_verify($data, base64_decode($ds_sign), $ds_pub_key, 'RSA-SHA256');
        if ($valid == 1){
            return $ds_sign;
        // echo "signature is valid \n";
        } else {
          echo "signature is NOT valid\n";
        }
        // same thing about freeing of key
        openssl_free_key($ds_pub_key);

  }
  
  public static function ValidateKey($message)
  {
    $s = hash_hmac('sha256', $message, env('EZUGI_SECRET_KEY'), true);
    return base64_encode($s); 
  }
 
  //Generate KA Gaming hash key
  public static function generateHashKey($message) {
    // $message = json_encode(array(
    //     "partnerName" => env("KA_GAMING_PARTNER_NAME"),
    //     "accessKey"   => env("KA_GAMING_ACCESS_KEY"),
    //     "language"    => "en",
    //     "randomId"    => 690387167 //rand(000000000,999999999) 
    // ));
    $key = env("KA_GAMING_SECRET_KEY");
    $hash = hash_hmac('sha256', $message, $key);

    return $hash;
    // $res['hashKey'] = $hash;
    // $res['requestData'] = $message;

    // return $res;
  }

}
