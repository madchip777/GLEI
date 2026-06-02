<?php

namespace Tests\Feature;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * AuthService Feature Tests
 *
 * Tests authentication logic (login / logout).
 * Uses the real UserRepository (DB-backed) via the service container.
 */
class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuthService $service;

    protected function setUp(): void
    {
        parent::setUp();

        // Resolve via container so the repository binding from AppServiceProvider works
        $this->service = $this->app->make(AuthService::class);
    }

    // =========================================================================
    // login()
    // =========================================================================

    /** @test */
    public function it_returns_user_and_token_on_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email'    => 'alice@test.com',
            'password' => 'secret123',   // factory hashes via Hash::make()
            'role'     => 'user',
        ]);

        $result = $this->service->login('alice@test.com', 'secret123');

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertEquals($user->id, $result['user']->id);
        $this->assertNotEmpty($result['token']);
    }

    /** @test */
    public function it_creates_a_sanctum_token_in_db_on_login(): void
    {
        User::factory()->create([
            'email'    => 'bob@test.com',
            'password' => 'pass1234',
        ]);

        $this->service->login('bob@test.com', 'pass1234');

        // Token stored in personal_access_tokens table
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    /** @test */
    public function it_throws_validation_exception_on_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'charlie@test.com',
            'password' => 'correctpass',
        ]);

        $this->expectException(ValidationException::class);

        $this->service->login('charlie@test.com', 'wrongpass');
    }

    /** @test */
    public function it_throws_validation_exception_on_unknown_email(): void
    {
        $this->expectException(ValidationException::class);

        $this->service->login('nobody@test.com', 'anypassword');
    }

    // =========================================================================
    // logout()
    // =========================================================================

    /** @test */
    public function it_revokes_all_tokens_on_logout(): void
    {
        $user = User::factory()->create([
            'email'    => 'dave@test.com',
            'password' => 'mypassword',
        ]);

        // Login twice → 2 tokens
        $this->service->login('dave@test.com', 'mypassword');
        $this->service->login('dave@test.com', 'mypassword');

        $this->assertDatabaseCount('personal_access_tokens', 2);

        // Logout → all tokens deleted
        $this->service->logout($user);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    /** @test */
    public function it_returns_correct_user_role_after_login(): void
    {
        User::factory()->create([
            'email'    => 'admin@test.com',
            'password' => 'adminpass',
            'role'     => 'admin',
        ]);

        $result = $this->service->login('admin@test.com', 'adminpass');

        $this->assertEquals('admin', $result['user']->role);
    }
}
