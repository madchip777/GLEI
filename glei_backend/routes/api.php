<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Mock users (NO database)
$users = [
    [
        'id' => 1,
        'email' => 'test@example.com',
        'password' => '123456',
        'name' => 'Test User',
        'token' => 'abc123'
    ],
    [
        'id' => 2,
        'email' => 'admin@example.com',
        'password' => 'admin',
        'name' => 'Admin',
        'token' => 'admin456'
    ]
];

Route::get('/users', function () use ($users) {
    return response()->json(array_map(function ($user) {
        unset($user['password'], $user['token']);
        return $user;
    }, $users));
});

// LOGIN
Route::post('/login', function (Request $request) use ($users) {
    foreach ($users as $user) {
        if (
            $user['email'] === $request->email &&
            $user['password'] === $request->password
        ) {
            return response()->json([
                'user' => $user,
                'token' => $user['token']
            ]);
        }
    }

    return response()->json(['message' => 'Invalid credentials'], 401);
    
}); 

Route::middleware('fakeauth')->get('/profile', function () {
    return response()->json([
        'message' => 'You are authenticated!',
        'user' => 'Fake user data'
    ]);
});