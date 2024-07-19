# Based on the official Drupal Docker official image
# https://github.com/docker-library/drupal/blob/master/10.3/php8.3/apache-bookworm/Dockerfile


# https://www.drupal.org/docs/system-requirements/php-requirements
FROM php:8.3-apache-bookworm

# install the PHP extensions we need
RUN set -eux; \
    if command -v a2enmod; then \
    a2enmod expires rewrite; \
    fi; \
    savedAptMark="$(apt-mark showmanual)"; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    libfreetype6-dev \
    libjpeg-dev \
    libpng-dev \
    libpq-dev \
    libwebp-dev \
    libzip-dev ; \
    docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg=/usr \
    --with-webp \
    ; \
    docker-php-ext-install -j "$(nproc)" \
    gd \
    opcache \
    pdo_mysql \
    pdo_pgsql \
    zip \
    ; \
    apt-mark auto '.*' > /dev/null; \
    apt-mark manual $savedAptMark; \
    ldd "$(php -r 'echo ini_get("extension_dir");')"/*.so \
    | awk '/=>/ { so = $(NF-1); if (index(so, "/usr/local/") == 1) { next }; gsub("^/(usr/)?", "", so); print so }' \
    | sort -u \
    | xargs -r dpkg-query -S \
    | cut -d: -f1 \
    | sort -u \
    | xargs -rt apt-mark manual; \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update

# set recommended PHP.ini settings
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=60'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/

ENV COMPOSER_ALLOW_SUPERUSER 1
WORKDIR /opt/drupal

RUN set -eux; \
    export COMPOSER_HOME="$(mktemp -d)"; \
    mkdir -p /opt/drupal/web/sites; \
    mkdir -p /opt/drupal/web/modules; \
    mkdir -p /opt/drupal/web/themes; \
    chown -R www-data:www-data web/sites web/modules web/themes; \
    rmdir /var/www/html; \
    ln -sf /opt/drupal/web /var/www/html; \
    rm -rf "$COMPOSER_HOME"

ENV PATH=${PATH}:/opt/drupal/vendor/bin