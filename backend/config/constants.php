<?php
//file : app/config/constants.php
$notification_type_constants = array(
  'admin_free_text_notification' => 'ADMIN_FREE_TEXT_NOTIFICATION',
  'contest_invitation' => 'CONTEST_INVITATION',
  'winnings' => 'WINNINGS',
  'bulk_notification' => 'BULK_NOTIFICATION'
);
return [
	'IS_LOCAL_TIME' => 'true',
	'BACK_YEAR'=>'0 month',
	'ENVIRONMENT'=>'local',
	'ROOT_PATH'=>'/var/www/html/all-config/',
	'ROOT_IMAGE_PATH'=>env('APP_URL').'admin/backend/storage/app/',
	'IMAGE_PATH'=>'/var/www/html/uploads/',
	'AD_IMAGE_DIR'=>'advertisement',
	'NOTIFICATION_TYPE_CONSTANTS'=>$notification_type_constants,
	'DEFAULT_TIME_ZONE'=>'UTC',
	// 'PAYPAL_MODE' => (env('APP_ENV') === 'production') ? 'production' : 'sandbox',
	// 'PAYPAL_CLIENT_ID' => (env('APP_ENV') === 'production') ? '' : 'AQGkOO0-hPcm0mSSEpmMXlSTK5KMOkVY0Z2-6L-kgv5NdkDw3sKin-8KpfIynpbKfKKp7x-Afrgub3xL',
	// 'PAYPAL_CLIENT_SECRET' => (env('APP_ENV') === 'production') ? '' : 'EO-fJi4itSBsTifLUoG0aXg4z1yVd5TzgbHTWEMZp5rNNVnPZQGjdHqSB1jYXLY2gyct6bj5ugLojizM',
	'PAYPAL_MODE' => (env('APP_ENV') === 'production') ? 'production' : 'sandbox',
	'PAYPAL_CLIENT_ID' => (env('APP_ENV') === 'production') ? '' : 'AeDLVuJeN5LpqXsbgB2wffAwPNOgprvV5gEugiyCIJrhiquPYuob9lvLDqI13C0oS6bKS9leVFStdaiy',
	'PAYPAL_CLIENT_SECRET' => (env('APP_ENV') === 'production') ? '' : 'EJoVgJn0SbHoAjm2sFFxlGJEVG_tSkFSqYiHkcJ9K1aEXkJioEa6i3OIbRHl30I7MskRweDyDStY58VL',
	'VICTORY_TYPE_SCORE_POINT' => 300,
	'ROUND_SCORE_POINT' => 100,
];
