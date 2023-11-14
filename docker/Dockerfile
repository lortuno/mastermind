FROM php:8.2-fpm-alpine3.17

# Install essential build tools
RUN apk add --no-cache \
    git \
    yarn \
    autoconf \
    make \
    openssl-dev


#Composer installation
ENV COMPOSER_HOME /composer
ENV PATH ./vendor/bin:/composer/vendor/bin:$PATH
RUN rm -rf /var/cache/apk/* && rm -rf /tmp/* && \
    curl --insecure https://getcomposer.org/download/2.2.0/composer.phar -o /usr/bin/composer && chmod +x /usr/bin/composer

# add node
RUN apk add --update \
    nodejs \
    npm \
    curl \
    && rm -rf /tmp/*

#Timezone as in dev machine
ENV TZ Europe/Berlin

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN echo '[PHP]\ndate.timezone = "Europe/Berlin"\n' > /usr/local/etc/php/conf.d/tzone.ini
RUN echo 'memory_limit = 1G' >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini;
RUN composer self-update --2;

# setuo xdebug

RUN apk add --update --no-cache linux-headers

RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug


ADD docker/xdebug.ini /usr/local/etc/php/conf.d/

# init vendor
# RUN cd /var/www/html && composer install/