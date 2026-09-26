# MASTERMIND

Mastermind is a game with n position (default 4) of several colors, and you have to guess the secret combination
in less than 10 attempts (depending on difficulty).
In this project at the moment the valid colors are:
- R
- P
- G
- B
- Y

To start project without docker:
``
php -S localhost:8000 -t src 
``

To start project with docker:
``
docker compose up -d --build
``

Then install composer:
````
composer install
docker compose exec php-fpm composer install
````

To access the docker container:
``
docker compose exec php-fpm sh
``

You can browse to http://web.local

First approach is with Console views called from terminal.

To execute (add prefix for docker-compose when not inside the container):
```
php -f src/index.php
docker compose exec php-fpm php -f src/index.php
```

To trigger tests:

1- Trigger the command
```
vendor/bin/phpunit
docker compose exec php-fpm vendor/bin/phpunit
```
or filter just one file
```
vendor/bin/phpunit --filter ResultTest
docker-compose exec php-fpm vendor/bin/phpunit --filter ResultTest
```

2- To generate the Coverage report: 
```
 vendor/bin/phpunit --coverage-html tests/report
 docker-compose exec php-fpm  vendor/bin/phpunit --coverage-html tests/report
```

__About the container:__

See php.ini file
````
docker-compose exec php-fpm php --ini
````
or php version
``
docker-compose exec php-fpm php --version  
``

To stop it: 
``
docker compose down
``

To remove all containers:
``
docker system prune -a
``