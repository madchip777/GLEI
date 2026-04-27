<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $routeMiddleware = [
        'fakeauth' => \App\Http\Middleware\FakeAuth::class,
    ];
}