<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        // define a admin role 
        Gate::define('isAdmin', function($user) {
            return $user->role_id == '1';
            // return $user->role_id == 'admin';
         });
        
         //define a agent role 
         Gate::define('isAgent', function($user) {
            return $user->role_id == '2';
            //  return $user->role == 'agent';
         });
        //
    }
}
