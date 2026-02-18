# OneCall Setup Instructions

## 1. Database Setup
Ensure PostgreSQL is running and database `onecall` exists with user `onecall` / password `11221122`.

Run Migrations:
```bash
php artisan migrate
```

Seed Database:
```bash
php artisan db:seed
```
Default Admin Login:
- Email: `admin@onecall.com`
- Password: `password`

## 2. Dependencies
Install PHP dependencies:
```bash
composer install
```
Install Node dependencies:
```bash
npm install
npm run build
```

## 3. Real-Time Setup (WebSockets)
To enable real-time updates, install Reverb:
```bash
php artisan install:broadcasting
```
Choose `Reverb` when prompted.

## 4. Asterisk Configuration
Configure Asterisk 23 to use Realtime PJSIP with PostgreSQL.

### extconfig.conf
```ini
[settings]
ps_endpoints => odbc,asterisk,ps_endpoints
ps_auths => odbc,asterisk,ps_auths
ps_aors => odbc,asterisk,ps_aors
ps_domain_aliases => odbc,asterisk,ps_domain_aliases
ps_endpoint_id_ips => odbc,asterisk,ps_endpoint_id_ips
ps_contacts => odbc,asterisk,ps_contacts
```

### res_odbc.conf
```ini
[asterisk]
enabled => yes
dsn => onecall_dsn
username => onecall
password => 11221122
pre-connect => yes
```

### odbc.ini (System ODBC Config)
```ini
[onecall_dsn]
Driver = PostgreSQL
Description = PostgreSQL Data Source
Servername = 127.0.0.1
Port = 5432
Database = onecall
UserName = onecall
Password = 11221122
```

## 5. Running the Application
```bash
php artisan serve
npm run dev
```
