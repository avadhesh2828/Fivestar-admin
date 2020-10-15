<?php

function random_string($type = 'alnum', $len = 8)
{
	switch ($type)
	{
		case 'basic':
			return mt_rand();
		case 'alnum':
		case 'numeric':
		case 'nozero':
		case 'alpha':
			switch ($type)
			{
				case 'alpha':
					$pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
					break;
				case 'alnum':
					$pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
					break;
				case 'numeric':
					$pool = '0123456789';
					break;
				case 'nozero':
					$pool = '123456789';
					break;
			}
			return substr(str_shuffle(str_repeat($pool, ceil($len / strlen($pool)))), 0, $len);
		case 'unique': // todo: remove in 3.1+
		case 'md5':
			return md5(uniqid(mt_rand()));
		case 'encrypt': // todo: remove in 3.1+
		case 'sha1':
			return sha1(uniqid(mt_rand(), TRUE));
	}
}

function format_date($date = 'today', $format = 'Y-m-d H:i:s')
{
  if ($date == "today") {
    if (Config::get('constants.IS_LOCAL_TIME') === true) {
      $back_time = strtotime(Config::get('constants.BACK_YEAR'));
      $dt = date($format, $back_time);
    } else {
      $dt = date($format);
    }
  } else {
    if (is_numeric($date)) {
      $dt = date($format, $date);
    } else {
      if ($date != null) {
        $dt = date($format, strtotime($date));
      } else {
        $dt = "--";
      }
    }
  }
  if (Config::get('constants.ENVIRONMENT') == 'production') {
    return $dt;
  } else {
    $path = Config::get('constants.ROOT_PATH') . 'date_time.php';
    if (file_exists($path)) {
      include($path);
    }

    if (isset($date_time) && $date_time) {
      $dt = date($format, strtotime($date_time));
    }

    return $dt;
  }
}


