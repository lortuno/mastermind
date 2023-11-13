#!/bin/sh

# setup xdebug
mkdir -p docker/php/conf.d
touch docker/php/conf.d/xdebug.ini
touch docker/php/conf.d/error_reporting.ini


#echo 'zend_extension=xdebug' >> /usr/local/etc/php.ini
#echo 'zend_extension=/usr/local/lib/php/extensions/no-debug-non-zts-20220829/xdebug.so' >> /usr/local/etc/php.ini