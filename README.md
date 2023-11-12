# MASTERMIND

Mastermind is a game with n position (default 4) of several colors, and you have to guess the secret combination
in less than 10 attempts (depending on difficulty).
In this project at the moment the valid colors are:
- R
- P
- G
- B
- Y

First approach is with Console views called from terminal.

To execute:
``
php -f src/index.php
``

To trigger tests:

1- First install vendor with composer
```composer install```

2- Then trigger the command
```
vendor/bin/phpunit
```
or filter just one file
```
vendor/bin/phpunit --filter ResultTest
```