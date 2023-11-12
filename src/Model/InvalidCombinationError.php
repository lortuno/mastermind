<?php

class InvalidCombinationError extends Exception
{
    public function __construct(?string $message = null, Throwable $previous = null)
    {
        if (!$message) {
            $message = $this->getErrorMessage();
        }

        $code = 400;
        parent::__construct($message, $code, $previous);
    }

    public function getErrorMessage(): string
    {
        return 'Valor inválido.';
    }
}
