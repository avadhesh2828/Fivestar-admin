<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CheckRoles
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // echo json_encode(Auth::user()->role_id);die;

        if (Auth::user()->role_id != 1) {
            return response()->json(['response_code'=> 404,'message' => 'You dont have a permission ! only admin can access'],404); 
        }

        // if (Auth::user()->role_id != 2) {
        //     return response()->json(['response_code'=> 404,'message' => 'You dont have a permission ! only agent can access'],404); 
        // }
 
        return $next($request);
    }
}
