<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SuggestionType;
use App\Models\Suggestion;
use Validator;
use DB;
use Auth;

class SuggestionController extends Controller
{
    /**
     * get all suggestion 
     */
    public function index(Request $request) {

        $suggestion = new Suggestion;
        $suggestion = $suggestion->with(['user','suggestion_type']);
        $suggestion = $suggestion->orderBy('suggestion_id', 'DESC');
        $suggestion = $suggestion->paginate($request->per_page);
        return response()->json([
            'response_code' => 200,
            'service_name'  => 'suggestion',
            'data'          => $suggestion,
            'message'       => 'get all suggestion',
          ], 200);
    }

}