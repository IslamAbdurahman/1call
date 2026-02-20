# 🚀 OneCall — O'rnatish qo'llanmasi

> Call center tizimini noldan o'rnatish uchun to'liq qo'llanma.
> **OS:** Ubuntu 22.04/24.04 LTS (Debian based)

---

## 📋 Mundarija

- [0. Nginx o'rnatish](#0-nginx-ornatish)
- [1. PostgreSQL o'rnatish](#1-postgresql-ornatish)
- [2. Asterisk o'rnatish](#2-asterisk-ornatish)
- [3. ODBC o'rnatish](#3-odbc-ornatish)
- [4. PHP 8.3 o'rnatish](#4-php-83-ornatish)
- [5. Proyektni ishga tushirish](#5-proyektni-ishga-tushirish)

---

## 0. Nginx o'rnatish

### 0.1. Nginx ni o'rnatish

```bash
sudo apt update
sudo apt install -y nginx
```

### 0.2. Nginx ni ishga tushirish

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### 0.3. Saytni sozlash

Yangi sayt konfiguratsiyasini yarating:

```bash
sudo nano /etc/nginx/sites-available/onecall
```

Quyidagi konfiguratsiyani yozing:

```nginx
server {
    listen 80;
    server_name yourdomain.uz;  # O'z domeningizni yozing
    root /var/www/1call/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # WebSocket proxy (ARI uchun)
    location /ws {
        proxy_pass http://127.0.0.1:8088;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### 0.4. Saytni yoqish

```bash
sudo ln -s /etc/nginx/sites-available/onecall /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # Default saytni o'chirish
sudo nginx -t                                   # Konfiguratsiyani tekshirish
sudo systemctl reload nginx
```

### 0.5. (Ixtiyoriy) SSL sertifikat o'rnatish

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.uz
```

---

## 1. PostgreSQL o'rnatish

### 1.1. PostgreSQL ni o'rnatish

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### 1.2. PostgreSQL ni ishga tushirish

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.3. Ma'lumotlar bazasini yaratish

```bash
sudo -u postgres psql
```

PostgreSQL konsolida quyidagilarni bajaring:

```sql
CREATE USER onecall WITH PASSWORD '11221122';
CREATE DATABASE onecall OWNER onecall;
GRANT ALL PRIVILEGES ON DATABASE onecall TO onecall;
\q
```

### 1.4. Ulanishni tekshirish

```bash
psql -h 127.0.0.1 -U onecall -d onecall
# Parol so'ralganda: 11221122
```

Muvaffaqiyatli ulanganingizda `\q` bilan chiqing.

---

## 2. Asterisk o'rnatish

### 2.1. Asterisk 23 ni o'rnatish

```bash
sudo apt update
sudo apt install -y build-essential wget subversion \
    libncurses5-dev libssl-dev libxml2-dev libsqlite3-dev \
    uuid-dev libjansson-dev libedit-dev

cd /usr/src
sudo wget https://downloads.asterisk.org/pub/telephony/asterisk/asterisk-23-current.tar.gz
sudo tar xzf asterisk-23-current.tar.gz
cd asterisk-23.*/

# Kerakli kutubxonalarni o'rnatish
sudo contrib/scripts/get_mp3_source.sh
sudo contrib/scripts/install_prereq install

# Kompilatsiya
./configure --with-pjproject-bundled --with-jansson-bundled
make menuselect.makeopts

# res_odbc va res_config_odbc yoqilganligini tekshirish
# make menuselect  # (ixtiyoriy — interaktiv tartibda tanlash)

make -j$(nproc)
sudo make install
sudo make samples       # Namuna konfiguratsiya fayllari
sudo make config        # Systemd service fayllarini o'rnatish
sudo ldconfig
```

### 2.2. Asterisk foydalanuvchisini sozlash

```bash
sudo groupadd asterisk 2>/dev/null
sudo useradd -r -d /var/lib/asterisk -g asterisk asterisk 2>/dev/null
sudo usermod -aG audio,dialout asterisk

sudo chown -R asterisk:asterisk /etc/asterisk
sudo chown -R asterisk:asterisk /var/{lib,log,spool,run}/asterisk
```

### 2.3. Konfiguratsiya fayllarini deploy qilish

Proyektdagi tayyor konfiguratsiya fayllarini `/etc/asterisk/` ga ko'chirish:

```bash
sudo cp -r /var/www/1call/deploy/asterisk/* /etc/asterisk/
sudo chown -R asterisk:asterisk /etc/asterisk
```

> ⚡ **Muhim:** `deploy/asterisk/` papkasida barcha kerakli konfiguratsiyalar mavjud:
> - `ari.conf` — ARI interfeysi (user: `onecall`, password: `11221122`)
> - `http.conf` — HTTP server (port: 8088)
> - `pjsip.conf` — SIP transport sozlamalari (UDP + TCP)
> - `extconfig.conf` — Realtime ODBC mapping (PJSIP jadvallari)
> - `res_odbc.conf` — ODBC ulanish sozlamalari
> - `extensions.conf` — Dialplan (`from-internal` kontekst)
> - `modules.conf` — Modul yuklash tartibi (res_odbc preload)

### 2.4. http.conf da SSL sozlash (Ixtiyoriy)

Agar SSL ishlatmoqchi bo'lsangiz, `/etc/asterisk/http.conf` da TLS sertifikat yo'llarini o'zgartiring:

```ini
tlscertfile=/etc/letsencrypt/live/yourdomain.uz/cert.pem
tlsprivatekey=/etc/letsencrypt/live/yourdomain.uz/privkey.pem
```

### 2.5. Asteriskni ishga tushirish

```bash
sudo systemctl start asterisk
sudo systemctl enable asterisk
sudo systemctl status asterisk
```

### 2.6. Ulanishni tekshirish

```bash
sudo asterisk -rvvv
```

Asterisk konsolida:

```
pjsip show transports    # UDP va TCP transportlar ko'rinishi kerak
module show like odbc     # res_odbc va res_config_odbc yuklangan bo'lishi kerak
ari show users            # onecall useri ko'rinishi kerak
```

---

## 3. ODBC o'rnatish

ODBC — Asterisk bilan PostgreSQL o'rtasidagi ko'prik. Bu orqali Asterisk PJSIP endpointlarni to'g'ridan-to'g'ri bazadan o'qiydi.

### 3.1. ODBC drayverlarini o'rnatish

```bash
sudo apt install -y unixodbc unixodbc-dev odbc-postgresql
```

### 3.2. ODBC drayverini ro'yxatdan o'tkazish

Drayver yo'lini tekshiring:

```bash
find / -name "psqlodbcw.so" 2>/dev/null
# Odatda: /usr/lib/x86_64-linux-gnu/odbc/psqlodbcw.so
```

`/etc/odbcinst.ini` faylini sozlang:

```bash
sudo nano /etc/odbcinst.ini
```

```ini
[PostgreSQL]
Description = PostgreSQL ODBC driver (Unicode)
Driver      = /usr/lib/x86_64-linux-gnu/odbc/psqlodbcw.so
Setup       = /usr/lib/x86_64-linux-gnu/odbc/libodbcpsqlS.so
UsageCount  = 1
Threading   = 2
```

> ⚠️ `Driver` yo'li yuqoridagi `find` natijasiga mos kelishi kerak.

### 3.3. DSN sozlash

Proyektdagi tayyor `odbc.ini` ni ko'chirish:

```bash
sudo cp /var/www/1call/deploy/odbc.ini /etc/odbc.ini
```

Yoki qo'lda yaratish:

```bash
sudo nano /etc/odbc.ini
```

```ini
[asterisk]
Driver      = PostgreSQL
Description = PostgreSQL Data Source
Servername  = 127.0.0.1
Port        = 5432
Database    = onecall
UserName    = onecall
Password    = 11221122
```

> ⚡ **Muhim:** DSN nomi `asterisk` bo'lishi kerak — `res_odbc.conf` dagi `dsn => asterisk` ga mos kelishi uchun.

### 3.4. ODBC ulanishni tekshirish

```bash
isql -v asterisk onecall 11221122
```

Muvaffaqiyatli natija:

```
+---------------------------------------+
| Connected!                            |
| sql-statement                         |
| help [tablename]                      |
| echo [string]                         |
| quit                                  |
+---------------------------------------+
```

`quit` bilan chiqing.

### 3.5. Asterisk ODBC ulanishni tekshirish

```bash
sudo asterisk -rx "odbc show"
```

Kutilgan natija:

```
ODBC DSN Settings
-----------------
  Name:   asterisk
  DSN:    asterisk
    Last connection attempt: ...
    Pooled: No
    Connected: Yes
```

---

## 4. PHP 8.3 o'rnatish

### 4.1. PHP repository qo'shish

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
```

### 4.2. PHP 8.3 va kerakli extensionlarni o'rnatish

```bash
sudo apt install -y \
    php8.3-fpm \
    php8.3-cli \
    php8.3-pgsql \
    php8.3-mbstring \
    php8.3-xml \
    php8.3-curl \
    php8.3-zip \
    php8.3-bcmath \
    php8.3-intl \
    php8.3-gd \
    php8.3-tokenizer \
    php8.3-fileinfo \
    php8.3-dom \
    php8.3-odbc
```

### 4.3. PHP-FPM ni ishga tushirish

```bash
sudo systemctl start php8.3-fpm
sudo systemctl enable php8.3-fpm
sudo systemctl status php8.3-fpm
```

### 4.4. O'rnatilgan extensionlarni tekshirish

```bash
php -m | grep -iE 'pgsql|mbstring|xml|curl|zip|bcmath|intl|gd|tokenizer|fileinfo|dom|odbc|pdo'
```

### 4.5. Composer o'rnatish

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### 4.6. Node.js va NPM o'rnatish

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

## 5. Proyektni ishga tushirish

### 5.1. Proyektni klonlash

```bash
cd /var/www
sudo git clone <REPOSITORY_URL> 1call
sudo chown -R www-data:www-data /var/www/1call
cd /var/www/1call
```

### 5.2. PHP kutubxonalarini o'rnatish

```bash
composer install --optimize-autoloader --no-dev
```

### 5.3. Node kutubxonalarini o'rnatish va build qilish

```bash
npm install
npm run build
```

### 5.4. `.env` faylini sozlash

```bash
cp .env.example .env
php artisan key:generate
```

`.env` faylini tahrirlang:

```bash
nano .env
```

Asosiy sozlamalar:

```env
APP_NAME=OneCall
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.uz

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=onecall
DB_USERNAME=onecall
DB_PASSWORD=11221122

ARI_HOST=localhost:8088
ARI_USER=onecall
ARI_PASSWORD=11221122
ARI_APP=onecall
```

### 5.5. Ma'lumotlar bazasini migratsiya qilish

```bash
php artisan migrate --force
```

### 5.6. Seed ma'lumotlarini yuklash

```bash
php artisan db:seed
```

### 5.7. Storage linkini yaratish

```bash
php artisan storage:link
```

### 5.8. Keshlarni optimallashtirish (Production)

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5.9. Huquqlarni sozlash

```bash
sudo chown -R www-data:www-data /var/www/1call
sudo chmod -R 775 /var/www/1call/storage
sudo chmod -R 775 /var/www/1call/bootstrap/cache
```

### 5.10. ARI listenerni ishga tushirish

ARI listener fon rejimida ishlashi kerak. Systemd service yarating:

```bash
sudo nano /etc/systemd/system/onecall-ari.service
```

```ini
[Unit]
Description=OneCall ARI Listener
After=network.target asterisk.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/1call
ExecStart=/usr/bin/php artisan ari:listen
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start onecall-ari
sudo systemctl enable onecall-ari
sudo systemctl status onecall-ari
```

### 5.11. Barcha xizmatlarni tekshirish

Barcha xizmatlar ishlayotganini tekshiring:

```bash
# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql

# PHP-FPM
sudo systemctl status php8.3-fpm

# Asterisk
sudo systemctl status asterisk

# ARI Listener
sudo systemctl status onecall-ari
```

### 5.12. Brauzerda tekshirish

Brauzerda `https://yourdomain.uz` ni oching.

**Admin kirish:**
- Email: `admin@onecall.com`
- Parol: `password`

---

## 🔧 Foydali buyruqlar

```bash
# Laravel loglarni ko'rish
tail -f /var/www/1call/storage/logs/laravel.log

# Asterisk konsolga ulanish
sudo asterisk -rvvv

# ARI orqali endpointlarni tekshirish
curl -s -u onecall:11221122 http://localhost:8088/ari/endpoints | python3 -m json.tool

# PJSIP endpointlarni ko'rish
sudo asterisk -rx "pjsip show endpoints"

# ODBC ulanishni tekshirish
sudo asterisk -rx "odbc show"

# Migratsiya holatini ko'rish
php artisan migrate:status

# Keshlarni tozalash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## ⚠️ Muammolarni hal qilish

| Muammo | Yechim |
|--------|--------|
| Nginx 502 Bad Gateway | `sudo systemctl restart php8.3-fpm` |
| ODBC ulanish xatosi | `isql -v asterisk onecall 11221122` bilan tekshiring |
| Asterisk PJSIP yuklanmaydi | `sudo asterisk -rx "module show like pjsip"` bilan tekshiring |
| Migratsiya xatosi | `php artisan migrate:status` bilan holatni ko'ring |
| ARI ulanish xatosi | `curl -u onecall:11221122 http://localhost:8088/ari/asterisk/info` |
| Permission denied xatosi | `sudo chown -R www-data:www-data /var/www/1call` |
| ps_contacts jadval yo'q | `php artisan migrate --force` qayta ishga tushiring |
