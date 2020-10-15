<?php

namespace App\Rules\Contest;

use Illuminate\Contracts\Validation\Rule;

class EndDate implements Rule
{
  /**
   * Create a new rule instance.
   *
   * @return void
   */
  public function __construct($startDate)
  {
    $this->message = "";
    $this->startDate = $startDate;
  }

  /**
   * Determine if the validation rule passes.
   *
   * @param  string  $attribute
   * @param  mixed  $endDate
   * @return bool
   */
  public function passes($attribute, $endDate)
  {
    if( strtotime($this->startDate) > strtotime($endDate) ){
      $this->message = "End Date must be greater then Start Date";
      return FALSE;
    }
    return TRUE;
  }

  /**
   * Get the validation error message.
   *
   * @return string
   */
  public function message()
  {
      return $this->message;
  }
}
