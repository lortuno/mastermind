<?php

class ErrorView
{
    public function __construct(Exception $error)
    {
        echo $error->getMessage();
    }
}