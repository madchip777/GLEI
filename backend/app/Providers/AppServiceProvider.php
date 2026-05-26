<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\MockUserRepository;

/**
 * Application Service Provider
 *
 * Registers  application services and bindings.
 * Handles dependency injection container configuration.
 *
 * This is where we bind interfaces to concrete implementations,
 * enabling the repository pattern and dependency injection.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services
     *
     * Binds interfaces to implementations in the IoC container.
     * This allows automatic dependency injection throughout the app.
     *
     * Repository Pattern Benefits:
     * - Business logic doesn't depend on data source
     * - Easy to swap implementations (DB, cache, API, mock)
     * - Testable (can inject mock repositories)
     * - Single Responsibility Principle
     *
     * @return void
     */
    public function register(): void
    {
        /**
         * Bind User Repository Interface
         *
         * When UserRepositoryInterface is type-hinted in constructors,
         * Laravel will automatically inject MockUserRepository instance.
         * TODO - Change source to actual data
         *
         * To switch implementations:
         * - Change MockUserRepository to another class
         * - Or use conditional binding based on environment
         *
         * Example:
         * if (app()->environment('testing')) {
         *     $this->app->bind(UserRepositoryInterface::class, TestUserRepository::class);
         * } else {
         *     $this->app->bind(UserRepositoryInterface::class, MockUserRepository::class);
         * }
         */
        $this->app->bind(
            UserRepositoryInterface::class,
            MockUserRepository::class
        );
    }

    /**
     * Bootstrap application services
     *
     * Runs after all services are registered.
     * Used for:
     * - Event listeners
     * - Route model bindings
     * - View composers
     * - Etc.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
