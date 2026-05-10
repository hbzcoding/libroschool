<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class AttemptSanctumAuth
{
    /**
     * Handle an incoming request.
     *
     * Attempts to authenticate the user via Sanctum token
     * without requiring authentication. This allows the policy
     * system to access the authenticated user when present.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken()) {
            $accessToken = PersonalAccessToken::findToken($request->bearerToken());

            if ($accessToken) {
                $tokenable = $accessToken->tokenable;

                if ($tokenable) {
                    // Use loginUsingId for stateless authentication
                    // so policies can access the authenticated user
                    auth()->loginUsingId($tokenable->id);
                }
            }
        }

        return $next($request);
    }
}
