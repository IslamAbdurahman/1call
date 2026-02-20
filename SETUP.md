# 🚀 OneCall — O'rnatish qo'llanmasi

> Call center tizimini noldan o'rnatish uchun to'liq qo'llanma.
> **OS:** Ubuntu 22.04/24.04 LTS (Debian based)

---

## 📋 Mundarija

- [0. Nginx o'rnatish](#0-nginx-ornatish)
- [1. PostgreSQL o'rnatish](#1-postgresql-ornatish)
- [2. Proyektni klonlash](#2-proyektni-klonlash)
- [3. Asterisk o'rnatish](#3-asterisk-ornatish)
- [4. ODBC o'rnatish](#4-odbc-ornatish)
- [5. PHP 8.3 o'rnatish](#5-php-83-ornatish)
- [6. Proyektni ishga tushirish](#6-proyektni-ishga-tushirish)

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

## 2. Proyektni klonlash

Asterisk konfiguratsiyalarini ko'chirish uchun avval proyekt klonlanishi kerak.

### 2.1. Git o'rnatish

```bash
sudo apt install -y git
```

### 2.2. Proyektni klonlash

```bash
cd /var/www
sudo git clone git@github.com:IslamAbdurahman/1call.git
cd /var/www/1call
```

> ⚡ **Eslatma:** SSH kalitingiz GitHub'ga qo'shilgan bo'lishi kerak.
> Agar SSH kalit yo'q bo'lsa, HTTPS orqali klonlang:
> ```bash
> sudo git clone https://github.com/IslamAbdurahman/1call.git
> ```

---

## 3. Asterisk o'rnatish

> Manba: [efsol.ru — Asterisk o'rnatish (rasmlar bilan)](https://efsol.ru/manuals/install-asterisk22-ubuntu-source/)
> Quyida Asterisk **23** versiyasi uchun moslashtirilgan.
> 📸 Har bir qadam uchun rasmli ko'rsatmalar yuqoridagi havolada mavjud.

### 3.1. Tizimni yangilash

```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2. Kerakli kutubxonalarni o'rnatish

Asteriskni kompilatsiya qilish va ishlashi uchun kerakli paketlar:

```bash
sudo apt install -y build-essential wget subversion \
    libjansson-dev libxml2-dev libssl-dev libncurses5-dev \
    libnewt-dev libsqlite3-dev libcurl4-openssl-dev \
    libspandsp-dev libsrtp2-dev libyuv-dev libpcap-dev \
    pkg-config libiksemel-dev uuid-dev libedit-dev \
    libgsm1-dev libncurses-dev
```

### 3.3. Asterisk 23 manba kodini yuklab olish

```bash
cd /usr/src
sudo wget https://downloads.asterisk.org/pub/telephony/asterisk/asterisk-23-current.tar.gz
sudo tar -zxvf asterisk-23-current.tar.gz
cd asterisk-23*/
```

### 3.4. Asterisk uchun qo'shimcha kutubxonalarni o'rnatish

```bash
sudo contrib/scripts/install_prereq install
```

### 3.5. Konfiguratsiya (configure)

```bash
sudo ./configure
```

Muvaffaqiyatli tugagandan so'ng, Asterisk logotipi ko'rinadi.

### 3.6. Menuselect — modullarni tanlash

```bash
sudo make menuselect
```

> ⚡ **Muhim tanlashlar:**
> - **Add-ons** — kerakli qo'shimchalarni yoqing
> - **Core Sound Packages** — rus (`ru`) va ingliz (`en`) ovoz paketlarini tanlang
> - **Music on Hold** — kerakli formatlarni tanlang
> - **Resource Modules** — `res_odbc` va `res_config_odbc` **yoqilgan** bo'lishi kerak!
>
> Tugallangach, `Save & Exit` ni tanlang.

### 3.7. Kompilatsiya

```bash
sudo make -j$(nproc)
```

### 3.8. O'rnatish

```bash
sudo make install
```

### 3.9. Konfiguratsiya fayllarini o'rnatish

```bash
sudo make samples
```

### 3.10. Ishga tushirish skriptlarini o'rnatish

```bash
sudo make config
sudo ldconfig
```

### 3.11. Asterisk xizmatini sozlash

```bash
sudo systemctl enable asterisk
sudo systemctl start asterisk
```

### 3.12. O'rnatishni tekshirish

```bash
sudo asterisk -rvvv
```

Asterisk konsoli ochilib, versiya ma'lumoti ko'rinishi kerak. Chiqish uchun `exit`.

### 3.13. Asterisk foydalanuvchisini sozlash

```bash
sudo groupadd asterisk 2>/dev/null
sudo useradd -r -d /var/lib/asterisk -g asterisk asterisk 2>/dev/null
sudo usermod -aG audio,dialout asterisk

sudo chown -R asterisk:asterisk /etc/asterisk
sudo chown -R asterisk:asterisk /var/{lib,log,spool,run}/asterisk
```

### 3.14. Proyekt konfiguratsiyalarini deploy qilish

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

### 3.15. (Ixtiyoriy) http.conf da SSL sozlash

Agar SSL ishlatmoqchi bo'lsangiz, `/etc/asterisk/http.conf` da TLS sertifikat yo'llarini o'zgartiring:

```ini
tlscertfile=/etc/letsencrypt/live/yourdomain.uz/cert.pem
tlsprivatekey=/etc/letsencrypt/live/yourdomain.uz/privkey.pem
```

### 3.16. Asteriskni qayta ishga tushirish (deploy dan keyin)

```bash
sudo systemctl restart asterisk
```

### 3.17. To'liq tekshirish

```bash
sudo asterisk -rvvv
```

Asterisk konsolida quyidagilarni tekshiring:

```
pjsip show transports    # UDP va TCP transportlar ko'rinishi kerak
module show like odbc     # res_odbc va res_config_odbc yuklangan bo'lishi kerak
ari show users            # onecall useri ko'rinishi kerak
```

---

## 4. ODBC o'rnatish

ODBC — Asterisk bilan PostgreSQL o'rtasidagi ko'prik. Bu orqali Asterisk PJSIP endpointlarni to'g'ridan-to'g'ri bazadan o'qiydi.

### 4.1. ODBC drayverlarini o'rnatish

```bash
sudo apt install -y unixodbc unixodbc-dev odbc-postgresql
```

### 4.2. ODBC drayverini ro'yxatdan o'tkazish

Avval drayver yo'lini tekshiring:

```bash
find / -name "psqlodbcw.so" 2>/dev/null
# Odatda: /usr/lib/x86_64-linux-gnu/odbc/psqlodbcw.so
```

`/etc/odbcinst.ini` faylini yozing (drayver yo'li yuqoridagi natijaga mos bo'lishi kerak):

```bash
sudo tee /etc/odbcinst.ini << 'EOF'
[PostgreSQL]
Description = PostgreSQL ODBC driver (Unicode)
Driver      = /usr/lib/x86_64-linux-gnu/odbc/psqlodbcw.so
Setup       = /usr/lib/x86_64-linux-gnu/odbc/libodbcpsqlS.so
UsageCount  = 1
Threading   = 2
EOF
```

> ⚠️ `Driver` yo'li yuqoridagi `find` natijasiga mos kelishi kerak.

### 4.3. DSN sozlash

`/etc/odbc.ini` faylini yozing:

```bash
sudo tee /etc/odbc.ini << 'EOF'
[asterisk]
Driver      = PostgreSQL
Description = PostgreSQL Data Source
Servername  = 127.0.0.1
Port        = 5432
Database    = onecall
UserName    = onecall
Password    = 11221122
EOF
```

> ⚡ **Muhim:** DSN nomi `[asterisk]` bo'lishi **shart** — `res_odbc.conf` dagi `dsn => asterisk` ga mos kelishi uchun.
> Agar DSN nomi boshqacha bo'lsa, `Data source name not found` xatosi chiqadi!

### 4.4. ODBC ulanishni tekshirish

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

### 4.5. Asterisk ODBC ulanishni tekshirish

ODBC sozlangandan keyin Asteriskni qayta ishga tushiring:

```bash
sudo systemctl restart asterisk
```

Keyin tekshiring:

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

Agar `Connected: Yes` ko'rinsangiz — ODBC to'g'ri ishlayapti! ✅

---

## 5. PHP 8.3 o'rnatish

### 5.1. PHP repository qo'shish

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
```

### 5.2. PHP 8.3 va kerakli extensionlarni o'rnatish

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

### 5.3. PHP-FPM ni ishga tushirish

```bash
sudo systemctl start php8.3-fpm
sudo systemctl enable php8.3-fpm
sudo systemctl status php8.3-fpm
```

### 5.4. O'rnatilgan extensionlarni tekshirish

```bash
php -m | grep -iE 'pgsql|mbstring|xml|curl|zip|bcmath|intl|gd|tokenizer|fileinfo|dom|odbc|pdo'
```

### 5.5. Composer o'rnatish

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### 5.6. Node.js va NPM o'rnatish

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

## 6. Proyektni ishga tushirish

### 6.1. PHP kutubxonalarini o'rnatish

```bash
composer install --optimize-autoloader --no-dev
```

### 6.2. Node kutubxonalarini o'rnatish va build qilish

```bash
npm install
npm run build
```

### 6.3. `.env` faylini sozlash

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

### 6.4. Ma'lumotlar bazasini migratsiya qilish

```bash
php artisan migrate --force
```

### 6.5. Seed ma'lumotlarini yuklash

```bash
php artisan db:seed
```

### 6.6. Storage linkini yaratish

```bash
php artisan storage:link
```

### 6.7. Keshlarni optimallashtirish (Production)

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 6.8. Huquqlarni sozlash

```bash
sudo chown -R www-data:www-data /var/www/1call
sudo chmod -R 775 /var/www/1call/storage
sudo chmod -R 775 /var/www/1call/bootstrap/cache
```

### 6.9. ARI listenerni ishga tushirish

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

### 6.10. Barcha xizmatlarni tekshirish

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

### 6.11. Brauzerda tekshirish

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
