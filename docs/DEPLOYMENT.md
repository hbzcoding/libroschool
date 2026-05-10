# LibroSchool 部署文档

> 本文档详细说明 LibroSchool 平台的完整部署流程，包括后端（Laravel）、前端（Next.js）和存储（Cloudflare R2）的配置。

---

## 目录

1. [架构概述](#1-架构概述)
2. [前置条件](#2-前置条件)
3. [后端部署步骤](#3-后端部署步骤)
4. [前端部署步骤](#4-前端部署步骤)
5. [Cloudflare R2 配置](#5-cloudflare-r2-配置)
6. [部署检查清单](#6-部署检查清单)
7. [常见问题排查](#7-常见问题排查)
8. [回滚步骤](#8-回滚步骤)
9. [监控和日志](#9-监控和日志)

---

## 1. 架构概述

### 1.1 部署架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Next.js Frontend                                                    │
│  部署平台: Vercel                                                      │
│  域名: https://app.libroschool.com                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ API 请求
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Laravel Backend API                                                 │
│  部署平台: VPS (Ubuntu)                                                │
│  域名: https://api.libroschool.com                                     │
│  组件: Nginx + PHP-FPM + PostgreSQL                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌─────────────────────┐          ┌─────────────────────┐
        │   PostgreSQL        │          │   Cloudflare R2     │
        │   数据库 (VPS)       │          │   图片存储           │
        └─────────────────────┘          └─────────────────────┘
```

### 1.2 技术栈

| 组件 | 技术 | 部署位置 |
|------|------|----------|
| 前端 | Next.js 15 + TypeScript | Vercel |
| 后端 | Laravel 12 + PHP 8.3+ | VPS (Ubuntu) |
| 数据库 | PostgreSQL 16 | VPS |
| 文件存储 | Cloudflare R2 | Cloudflare |
| 认证 | Laravel Sanctum | VPS |
| Web 服务器 | Nginx | VPS |
| 进程管理 | Supervisor | VPS |
| DNS/CDN | Cloudflare | Cloudflare |

### 1.3 域名规划

```text
生产环境:
- app.libroschool.com  → Vercel (Next.js 前端)
- api.libroschool.com  → VPS (Laravel API)
- cdn.libroschool.com  → Cloudflare R2 (图片资源)

开发环境:
- dev-app.libroschool.com  → Vercel (预览环境)
- dev-api.libroschool.com  → VPS (开发 API)
```

---

## 2. 前置条件

### 2.1 服务器要求

#### VPS 最低配置

```text
CPU: 2 核
内存: 4 GB RAM
存储: 50 GB SSD
带宽: 不限流量
位置: 欧洲 (建议意大利或德国)
```

#### 推荐配置 (生产环境)

```text
CPU: 4 核
内存: 8 GB RAM
存储: 100 GB SSD
带宽: 不限流量
位置: 欧洲
```

### 2.2 域名和 SSL

- [ ] 已注册域名（如 libroschool.com）
- [ ] 已配置 Cloudflare DNS
- [ ] 已启用 Cloudflare SSL/TLS（Full Strict 模式）

### 2.3 云服务账号

- [ ] Cloudflare 账号（用于 DNS、CDN、R2 存储）
- [ ] Vercel 账号（用于前端部署）
- [ ] VPS 提供商账号（如 DigitalOcean, Hetzner, AWS EC2）

### 2.4 本地工具

```bash
# 确保已安装以下工具
ssh -V                    # SSH 客户端
git --version             # Git
curl --version            # cURL
# 可选: ngrok, postman
```

---

## 3. 后端部署步骤

### 3.1 服务器环境准备

#### 3.1.1 系统更新

```bash
# 登录 VPS
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y

# 安装基础工具
apt install -y curl wget git unzip software-properties-common
```

#### 3.1.2 安装 PHP 8.3

```bash
# 添加 PHP PPA
add-apt-repository ppa:ondrej/php -y
apt update

# 安装 PHP 8.3 及扩展
apt install -y php8.3-fpm php8.3-cli php8.3-common php8.3-pgsql \
    php8.3-mbstring php8.3-xml php8.3-bcmath php8.3-curl php8.3-zip \
    php8.3-gd php8.3-fileinfo php8.3-tokenizer php8.3-openssl

# 验证安装
php -v
```

#### 3.1.3 安装 Composer

```bash
# 下载 Composer
curl -sS https://getcomposer.org/installer | php

# 移动到系统目录
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# 验证安装
composer --version
```

#### 3.1.4 安装 PostgreSQL 16

```bash
# 添加 PostgreSQL 仓库
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update

# 安装 PostgreSQL
apt install -y postgresql-16 postgresql-client-16

# 启动并设置开机自启
systemctl enable postgresql
systemctl start postgresql

# 验证安装
psql --version
```

#### 3.1.5 安装 Node.js (用于构建)

```bash
# 使用 NodeSource 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node -v
npm -v
```

#### 3.1.6 安装 Nginx

```bash
apt install -y nginx

# 启动并设置开机自启
systemctl enable nginx
systemctl start nginx

# 验证安装
nginx -v
```

#### 3.1.7 安装 Supervisor

```bash
apt install -y supervisor
systemctl enable supervisor
systemctl start supervisor
```

### 3.2 数据库配置

#### 3.2.1 创建数据库和用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库
CREATE DATABASE libroschool;
CREATE DATABASE libroschool_test;

# 创建用户
CREATE USER libroschool_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# 授权
GRANT ALL PRIVILEGES ON DATABASE libroschool TO libroschool_user;
GRANT ALL PRIVILEGES ON DATABASE libroschool_test TO libroschool_user;

# 退出
\q
```

### 3.3 代码部署

#### 3.3.1 创建部署目录

```bash
# 创建目录
mkdir -p /var/www/libroschool
chown -R www-data:www-data /var/www/libroschool
```

#### 3.3.2 部署代码 (Git 方式)

```bash
# 切换到 www-data 用户
sudo -u www-data bash

# 克隆代码
cd /var/www/libroschool
git clone https://github.com/your-org/libroschool.git backend
cd backend

# 切换到生产分支
git checkout main

# 退出 www-data 用户
exit
```

#### 3.3.3 安装依赖

```bash
cd /var/www/libroschool/backend

# 安装 PHP 依赖
sudo -u www-data composer install --no-dev --optimize-autoloader

# 安装 Node 依赖并构建
sudo -u www-data npm ci
sudo -u www-data npm run build
```

### 3.4 环境变量配置

#### 3.4.1 创建 .env 文件

```bash
cd /var/www/libroschool/backend
cp .env.example .env
chown www-data:www-data .env
chmod 640 .env
```

#### 3.4.2 编辑 .env 配置

```bash
sudo -u www-data nano .env
```

**必需配置项清单：**

```env
# 应用基础配置
APP_NAME=LibroSchool
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://api.libroschool.com
APP_LOCALE=it

# 数据库配置
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=libroschool
DB_USERNAME=libroschool_user
DB_PASSWORD=your_secure_password

# 会话和缓存
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=.libroschool.com
CACHE_STORE=database

# Sanctum 配置
SANCTUM_STATEFUL_DOMAINS=app.libroschool.com,libroschool.com
FRONTEND_URL=https://app.libroschool.com

# 队列配置
QUEUE_CONNECTION=database

# 文件系统配置
FILESYSTEM_DISK=local
BOOK_IMAGES_DISK=r2

# Cloudflare R2 配置 (S3 兼容)
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET=libroschool-images
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_URL=https://pub-your-bucket-id.r2.dev
R2_REGION=auto

# 邮件配置 (可选)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@libroschool.com
MAIL_PASSWORD=your-mailgun-password
MAIL_FROM_ADDRESS=noreply@libroschool.com
MAIL_FROM_NAME="${APP_NAME}"

# 日志配置
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=warning
```

#### 3.4.3 生成应用密钥

```bash
cd /var/www/libroschool/backend
sudo -u www-data php artisan key:generate
```

### 3.5 数据库迁移和初始数据

#### 3.5.1 运行迁移

```bash
cd /var/www/libroschool/backend

# 运行迁移
sudo -u www-data php artisan migrate --force

# 运行数据填充 (仅首次部署)
sudo -u www-data php artisan db:seed --force
```

#### 3.5.2 验证数据库

```bash
sudo -u postgres psql -d libroschool -c "\dt"
```

### 3.6 存储链接

```bash
cd /var/www/libroschool/backend

# 创建存储链接
sudo -u www-data php artisan storage:link
```

### 3.7 队列 Worker 配置

#### 3.7.1 创建 Supervisor 配置文件

```bash
nano /etc/supervisor/conf.d/libroschool-worker.conf
```

添加以下内容：

```ini
[program:libroschool-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/libroschool/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
directory=/var/www/libroschool/backend
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/libroschool/worker.log
stopwaitsecs=3600
```

#### 3.7.2 创建日志目录并启动 Worker

```bash
# 创建日志目录
mkdir -p /var/log/libroschool
chown -R www-data:www-data /var/log/libroschool

# 更新 Supervisor 配置
supervisorctl reread
supervisorctl update

# 启动 Worker
supervisorctl start libroschool-worker:*

# 查看状态
supervisorctl status
```

### 3.8 定时任务 (Cron)

#### 3.8.1 编辑 Cron 任务

```bash
crontab -e -u www-data
```

#### 3.8.2 添加 Laravel 调度器

```cron
# Laravel 调度器
* * * * * cd /var/www/libroschool/backend && php artisan schedule:run >> /dev/null 2>&1
```

### 3.9 Nginx 配置

#### 3.9.1 创建 Nginx 配置文件

```bash
nano /etc/nginx/sites-available/libroschool-api
```

添加以下内容：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.libroschool.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.libroschool.com;
    root /var/www/libroschool/backend/public;

    # SSL 证书 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.libroschool.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.libroschool.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/api.libroschool.com/chain.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 日志
    access_log /var/log/nginx/libroschool-api-access.log;
    error_log /var/log/nginx/libroschool-api-error.log;

    # 索引文件
    index index.php;

    # 字符编码
    charset utf-8;

    # 位置配置
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP 处理
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3.9.2 启用站点

```bash
# 创建符号链接
ln -s /etc/nginx/sites-available/libroschool-api /etc/nginx/sites-enabled/

# 删除默认站点
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

### 3.10 SSL 证书 (Let's Encrypt)

#### 3.10.1 安装 Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

#### 3.10.2 申请证书

```bash
certbot --nginx -d api.libroschool.com --agree-tos --no-eff-email -m admin@libroschool.com
```

#### 3.10.3 自动续期测试

```bash
certbot renew --dry-run
```

#### 3.10.4 配置自动续期 Cron

```bash
echo "0 3 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### 3.11 优化和缓存

```bash
cd /var/www/libroschool/backend

# 配置缓存
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
sudo -u www-data php artisan event:cache

# 优化自动加载
sudo -u www-data composer dump-autoload --optimize
```

### 3.12 健康检查

```bash
# 测试 API 健康检查端点
curl https://api.libroschool.com/api/health

# 预期响应
{"status":"ok","service":"libroschool-api"}
```

---

## 4. 前端部署步骤

### 4.1 Vercel 项目创建

#### 4.1.1 通过 CLI 创建

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 进入前端目录
cd /path/to/libroschool/frontend

# 部署
vercel
```

#### 4.1.2 通过 Web 界面创建

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库
3. 选择 `frontend` 目录
4. 配置构建设置

### 4.2 环境变量配置

#### 4.2.1 在 Vercel Dashboard 中配置

访问 Project Settings → Environment Variables，添加以下变量：

```text
NEXT_PUBLIC_API_URL=https://api.libroschool.com
```

#### 4.2.2 或通过 CLI 配置

```bash
vercel env add NEXT_PUBLIC_API_URL
# 输入值: https://api.libroschool.com
```

### 4.3 构建配置

#### 4.3.1 vercel.json 配置

确保 `frontend/vercel.json` 存在：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

### 4.4 域名和 SSL

#### 4.4.1 添加自定义域名

1. 在 Vercel Dashboard 中进入 Domains
2. 添加 `app.libroschool.com`
3. 按照提示配置 DNS 记录

#### 4.4.2 Cloudflare DNS 配置

在 Cloudflare DNS 中添加 CNAME 记录：

```text
类型: CNAME
名称: app
目标: cname.vercel-dns.com
代理状态: 已代理 (橙色云朵)
TTL: 自动
```

#### 4.4.3 SSL 证书

Vercel 自动提供 SSL 证书，无需额外配置。

### 4.5 部署验证

```bash
# 访问前端
curl https://app.libroschool.com

# 检查 API 连接
curl https://app.libroschool.com/api/health
```

---

## 5. Cloudflare R2 配置

### 5.1 创建存储桶

#### 5.1.1 登录 Cloudflare Dashboard

1. 访问 https://dash.cloudflare.com
2. 进入 R2 服务

#### 5.1.2 创建存储桶

```text
存储桶名称: libroschool-images
位置: 自动选择 (Automatic)
```

### 5.2 API Token 配置

#### 5.2.1 创建 R2 API Token

1. 进入 R2 → Manage R2 API Tokens
2. 点击 "Create API Token"
3. 配置权限：
   - **权限**: Object Read & Write
   - **存储桶**: libroschool-images
   - **TTL**: 永久 (或根据安全策略设置)

#### 5.2.2 记录凭证

创建后会显示：

```text
Access Key ID:     xxxxxxxxxxxxxxxxxxxxxxxx
Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Endpoint:          https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.cloudflarestorage.com
```

### 5.3 CORS 配置

#### 5.3.1 设置 CORS 规则

在存储桶设置中添加 CORS 配置：

```json
[
  {
    "AllowedOrigins": [
      "https://app.libroschool.com",
      "https://libroschool.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

### 5.4 公开访问域名

#### 5.4.1 配置自定义域 (可选)

1. 在 R2 存储桶中点击 "Connect Domain"
2. 输入 `cdn.libroschool.com`
3. 按照提示添加 DNS 记录

#### 5.4.2 使用默认公开访问 URL

如果不使用自定义域，记录公开访问 URL：

```text
https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
```

### 5.5 Laravel 配置验证

在 `.env` 中配置 R2 后，测试上传功能：

```bash
cd /var/www/libroschool/backend

# 测试 R2 连接
sudo -u www-data php artisan tinker

# 在 tinker 中执行
>>> Storage::disk('r2')->put('test.txt', 'Hello R2');
>>> Storage::disk('r2')->url('test.txt');
```

---

## 6. 部署检查清单

### 6.1 部署前检查

#### 服务器环境
- [ ] VPS 已创建并可 SSH 访问
- [ ] 域名已注册并指向服务器
- [ ] Cloudflare 已配置 DNS
- [ ] 服务器系统已更新

#### 软件安装
- [ ] PHP 8.3+ 已安装
- [ ] Composer 已安装
- [ ] PostgreSQL 16 已安装
- [ ] Nginx 已安装
- [ ] Node.js 20 已安装
- [ ] Supervisor 已安装

#### 安全配置
- [ ] 已配置防火墙 (UFW)
- [ ] 已禁用 root SSH 登录
- [ ] 已配置 SSH 密钥认证
- [ ] 已安装 fail2ban

### 6.2 部署中检查

#### 后端部署
- [ ] 代码已克隆到 `/var/www/libroschool/backend`
- [ ] Composer 依赖已安装 (`--no-dev`)
- [ ] NPM 依赖已安装并构建
- [ ] `.env` 文件已配置
- [ ] 应用密钥已生成
- [ ] 数据库迁移已运行
- [ ] 存储链接已创建
- [ ] 队列 Worker 已配置
- [ ] Cron 任务已添加
- [ ] Nginx 配置已创建并测试
- [ ] SSL 证书已申请

#### 前端部署
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] 自定义域名已添加
- [ ] DNS 记录已配置

#### R2 配置
- [ ] 存储桶已创建
- [ ] API Token 已创建
- [ ] CORS 规则已配置
- [ ] 公开访问已启用

### 6.3 部署后检查

#### API 测试
```bash
# 健康检查
curl https://api.libroschool.com/api/health

# 预期响应: {"status":"ok","service":"libroschool-api"}
```
- [ ] 健康检查端点返回 200

#### 前端测试
```bash
# 首页访问
curl -I https://app.libroschool.com

# 预期: HTTP/2 200
```
- [ ] 前端首页可正常访问

#### 认证测试
- [ ] 可成功注册用户
- [ ] 可成功登录
- [ ] 可获取当前用户信息

#### 图片上传测试
- [ ] 可上传图片到 R2
- [ ] 图片可通过 CDN 访问
- [ ] 删除图片功能正常

#### 数据库测试
```bash
sudo -u postgres psql -d libroschool -c "SELECT COUNT(*) FROM users;"
```
- [ ] 数据库连接正常
- [ ] 表结构正确

#### 队列测试
```bash
supervisorctl status libroschool-worker
```
- [ ] Worker 进程运行中

#### SSL 证书测试
```bash
curl -vI https://api.libroschool.com 2>&1 | grep "SSL"
```
- [ ] SSL 证书有效
- [ ] HTTPS 重定向正常

#### 日志检查
```bash
# 检查错误日志
tail -f /var/log/nginx/libroschool-api-error.log
tail -f /var/www/libroschool/backend/storage/logs/laravel.log
tail -f /var/log/libroschool/worker.log
```
- [ ] 无严重错误日志

---

## 7. 常见问题排查

### 7.1 500 错误

#### 症状
API 返回 500 Internal Server Error

#### 排查步骤

```bash
# 1. 检查 Laravel 日志
tail -f /var/www/libroschool/backend/storage/logs/laravel.log

# 2. 检查 Nginx 错误日志
tail -f /var/log/nginx/libroschool-api-error.log

# 3. 检查 PHP-FPM 日志
tail -f /var/log/php8.3-fpm.log
```

#### 常见原因和解决方案

| 问题 | 解决方案 |
|------|----------|
| 权限问题 | `chmod -R 775 /var/www/libroschool/backend/storage` |
| 缓存问题 | `php artisan cache:clear && php artisan config:clear` |
| 数据库连接失败 | 检查 `.env` 数据库配置 |
| Composer 自动加载 | `composer dump-autoload` |
| 缺少扩展 | `apt install php8.3-{extension}` |

### 7.2 数据库连接失败

#### 症状
错误信息：`SQLSTATE[08006] [7] connection to server failed`

#### 排查步骤

```bash
# 1. 检查 PostgreSQL 状态
systemctl status postgresql

# 2. 检查监听配置
sudo -u postgres psql -c "SHOW listen_addresses;"

# 3. 检查 pg_hba.conf
grep -v "^#" /etc/postgresql/16/main/pg_hba.conf | grep -v "^$"

# 4. 测试连接
sudo -u www-data psql -h 127.0.0.1 -U libroschool_user -d libroschool -c "SELECT 1;"
```

#### 解决方案

```bash
# 编辑 pg_hba.conf
nano /etc/postgresql/16/main/pg_hba.conf

# 添加或修改以下行
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256

# 重载配置
systemctl reload postgresql
```

### 7.3 R2 上传失败

#### 症状
图片上传失败，返回 500 错误或超时

#### 排查步骤

```bash
# 1. 检查 R2 配置
cd /var/www/libroschool/backend
grep -E "^(R2_|AWS_)" .env

# 2. 测试 R2 连接
php artisan tinker
>>> Storage::disk('r2')->exists('test.txt');
```

#### 常见原因

| 问题 | 解决方案 |
|------|----------|
| Access Key 错误 | 重新生成 R2 API Token |
| Endpoint 错误 | 检查 `R2_ENDPOINT` 格式 |
| Bucket 名称错误 | 确认 Bucket 名称 |
| CORS 配置错误 | 检查 CORS 允许的域名 |
| 网络超时 | 检查服务器出站连接 |

### 7.4 CORS 问题

#### 症状
浏览器报错：`Access to fetch at '...' from origin '...' has been blocked by CORS policy`

#### 排查步骤

```bash
# 1. 检查 Laravel CORS 配置
cat /var/www/libroschool/backend/config/cors.php

# 2. 检查环境变量
grep -E "^(SANCTUM_STATEFUL_DOMAINS|FRONTEND_URL)" /var/www/libroschool/backend/.env
```

#### 解决方案

```env
# 更新 .env
SANCTUM_STATEFUL_DOMAINS=app.libroschool.com,libroschool.com,localhost:3000
FRONTEND_URL=https://app.libroschool.com

# 清除缓存
php artisan config:clear
```

### 7.5 认证问题

#### 症状
登录后无法保持会话，或 401 Unauthorized 错误

#### 排查步骤

```bash
# 1. 检查 Sanctum 配置
grep -E "^(SANCTUM_STATEFUL_DOMAINS|SESSION_DOMAIN)" /var/www/libroschool/backend/.env

# 2. 检查 Session 驱动
grep "SESSION_DRIVER" /var/www/libroschool/backend/.env

# 3. 检查数据库会话表
sudo -u postgres psql -d libroschool -c "SELECT COUNT(*) FROM sessions;"
```

#### 解决方案

```env
# 确保配置正确
SESSION_DRIVER=database
SESSION_DOMAIN=.libroschool.com
SANCTUM_STATEFUL_DOMAINS=app.libroschool.com,libroschool.com
```

#### 前端检查
确保前端请求包含必要的头部：

```javascript
// axios 配置示例
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
```

### 7.6 队列不处理

#### 症状
邮件或图片处理任务未执行

#### 排查步骤

```bash
# 1. 检查 Worker 状态
supervisorctl status libroschool-worker

# 2. 查看 Worker 日志
tail -f /var/log/libroschool/worker.log

# 3. 检查队列中的任务
sudo -u www-data php artisan queue:monitor

# 4. 手动运行队列
sudo -u www-data php artisan queue:work --once -v
```

#### 解决方案

```bash
# 重启 Worker
supervisorctl restart libroschool-worker:*

# 检查数据库连接
sudo -u www-data php artisan tinker
>>> DB::connection()->getPdo();
```

### 7.7 SSL 证书问题

#### 症状
浏览器显示证书不安全或过期

#### 排查步骤

```bash
# 1. 检查证书有效期
openssl x509 -in /etc/letsencrypt/live/api.libroschool.com/fullchain.pem -noout -dates

# 2. 检查证书续期
certbot certificates

# 3. 测试续期
certbot renew --dry-run
```

#### 解决方案

```bash
# 手动续期
certbot renew --force-renewal

# 重载 Nginx
systemctl reload nginx
```

---

## 8. 回滚步骤

### 8.1 后端回滚

#### 8.1.1 Git 回滚

```bash
cd /var/www/libroschool/backend

# 查看历史版本
git log --oneline -10

# 回滚到指定版本
git checkout <commit-hash>

# 或回滚到上一个版本
git checkout HEAD~1

# 安装依赖
sudo -u www-data composer install --no-dev --optimize-autoloader

# 运行迁移回滚 (如果需要)
sudo -u www-data php artisan migrate:rollback --step=1

# 清除缓存
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:cache

# 重启队列
supervisorctl restart libroschool-worker:*
```

#### 8.1.2 快速回滚脚本

创建 `/var/www/libroschool/rollback.sh`：

```bash
#!/bin/bash
set -e

BACKEND_DIR="/var/www/libroschool/backend"
COMMIT_HASH=$1

if [ -z "$COMMIT_HASH" ]; then
    echo "用法: ./rollback.sh <commit-hash>"
    exit 1
fi

cd $BACKEND_DIR

echo "回滚到版本: $COMMIT_HASH"
sudo -u www-data git checkout $COMMIT_HASH

echo "安装依赖..."
sudo -u www-data composer install --no-dev --optimize-autoloader

echo "清除缓存..."
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:cache

echo "重启队列..."
supervisorctl restart libroschool-worker:*

echo "回滚完成"
```

### 8.2 前端回滚

#### 8.2.1 Vercel 回滚

1. 访问 Vercel Dashboard → Deployments
2. 找到要回滚的版本
3. 点击 "..." → "Promote to Production"

#### 8.2.2 Git 回滚

```bash
cd frontend

# 回滚到指定版本
git checkout <commit-hash>

# 强制推送到生产分支 (谨慎使用)
git push -f origin main
```

### 8.3 数据库回滚

#### ⚠️ 重要警告

数据库回滚具有破坏性，可能导致数据丢失。请确保：

- [ ] 已备份当前数据库
- [ ] 了解回滚的影响范围
- [ ] 已通知相关团队成员

#### 8.3.1 使用 Laravel 迁移回滚

```bash
cd /var/www/libroschool/backend

# 回滚最后一次迁移
sudo -u www-data php artisan migrate:rollback

# 回滚指定步数
sudo -u www-data php artisan migrate:rollback --step=3

# 回滚到指定批次
sudo -u www-data php artisan migrate:rollback --batch=5
```

#### 8.3.2 使用数据库备份恢复

```bash
# 恢复备份
sudo -u postgres pg_dump libroschool > /backup/libroschool_$(date +%Y%m%d_%H%M%S).sql

# 恢复备份
sudo -u postgres psql libroschool < /backup/libroschool_backup.sql
```

#### 8.3.3 数据库备份脚本

创建 `/var/www/libroschool/backup.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/backup/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="libroschool"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
sudo -u postgres pg_dump $DB_NAME | gzip > "$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# 删除 7 天前的备份
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete

echo "备份完成: ${DB_NAME}_${DATE}.sql.gz"
```

添加定时任务：

```bash
crontab -e
# 每天凌晨 3 点备份
0 3 * * * /var/www/libroschool/backup.sh >> /var/log/libroschool/backup.log 2>&1
```

---

## 9. 监控和日志

### 9.1 Laravel 日志

#### 9.1.1 日志位置

```text
/var/www/libroschool/backend/storage/logs/laravel.log
```

#### 9.1.2 日志轮转

```bash
# 安装 logrotate
apt install -y logrotate

# 创建配置
cat > /etc/logrotate.d/libroschool << 'EOF'
/var/www/libroschool/backend/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    sharedscripts
    postrotate
        /usr/lib/php/php8.3-fpm-reopenlogs
    endscript
}
EOF
```

#### 9.1.3 实时查看日志

```bash
# 查看最新日志
tail -f /var/www/libroschool/backend/storage/logs/laravel.log

# 过滤错误日志
tail -f /var/www/libroschool/backend/storage/logs/laravel.log | grep ERROR

# 使用 Laravel Pail (如果已安装)
cd /var/www/libroschool/backend
php artisan pail
```

### 9.2 Nginx 日志

#### 9.2.1 日志位置

```text
访问日志: /var/log/nginx/libroschool-api-access.log
错误日志: /var/log/nginx/libroschool-api-error.log
```

#### 9.2.2 分析日志

```bash
# 查看 404 错误
grep " 404 " /var/log/nginx/libroschool-api-access.log

# 查看 500 错误
grep " 500 " /var/log/nginx/libroschool-api-access.log

# 查看访问最多的 IP
awk '{print $1}' /var/log/nginx/libroschool-api-access.log | sort | uniq -c | sort -rn | head -10
```

### 9.3 队列 Worker 日志

```text
/var/log/libroschool/worker.log
```

查看方法：

```bash
# 实时查看
tail -f /var/log/libroschool/worker.log

# 查看失败任务
sudo -u www-data php artisan queue:failed

# 重试失败任务
sudo -u www-data php artisan queue:retry all
```

### 9.4 建议监控工具

#### 9.4.1 基础监控

```bash
# 系统资源监控
htop
iostat -x 1
free -m
df -h
```

#### 9.4.2 应用监控

| 工具 | 用途 | 安装/配置 |
|------|------|-----------|
| **Laravel Telescope** | 开发调试 | 仅在开发环境启用 |
| **Sentry** | 错误追踪 | 注册 sentry.io，安装 SDK |
| **New Relic** | APM 监控 | 安装 PHP Agent |
| **Uptime Robot** | 可用性监控 | 注册 uptimerobot.com |
| **Cloudflare Analytics** | CDN/安全分析 | 自动启用 |

#### 9.4.3 配置 Sentry (推荐)

```bash
cd /var/www/libroschool/backend

# 安装 Sentry SDK
sudo -u www-data composer require sentry/sentry-laravel

# 发布配置
sudo -u www-data php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider"
```

在 `.env` 中添加：

```env
SENTRY_LARAVEL_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
SENTRY_TRACES_SAMPLE_RATE=0.1
```

#### 9.4.4 配置健康检查端点

确保健康检查端点可用：

```bash
curl https://api.libroschool.com/api/health
```

在 Uptime Robot 中添加监控：

```text
监控类型: HTTP(s)
URL: https://api.libroschool.com/api/health
监控间隔: 5 分钟
```

#### 9.4.5 数据库监控

```bash
# 检查数据库连接数
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# 检查数据库大小
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('libroschool'));"

# 检查慢查询
sudo -u postgres psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### 9.5 告警配置

#### 9.5.1 磁盘空间告警

创建 `/usr/local/bin/disk-check.sh`：

```bash
#!/bin/bash
THRESHOLD=80
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

if [ $USAGE -gt $THRESHOLD ]; then
    echo "警告: 磁盘使用率超过 ${THRESHOLD}%，当前: ${USAGE}%" | \
    mail -s "LibroSchool 磁盘告警" admin@libroschool.com
fi
```

添加定时任务：

```bash
crontab -e
*/30 * * * * /usr/local/bin/disk-check.sh
```

---

## 附录

### A. 快速命令参考

```bash
# 重启所有服务
systemctl restart nginx php8.3-fpm postgresql supervisor

# 查看服务状态
systemctl status nginx php8.3-fpm postgresql supervisor

# Laravel 命令
cd /var/www/libroschool/backend
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate:status
php artisan queue:restart

# 日志查看
tail -f /var/www/libroschool/backend/storage/logs/laravel.log
tail -f /var/log/nginx/libroschool-api-error.log
tail -f /var/log/libroschool/worker.log
```

### B. 文件权限参考

```bash
# 设置正确的权限
chown -R www-data:www-data /var/www/libroschool/backend
chmod -R 755 /var/www/libroschool/backend
chmod -R 775 /var/www/libroschool/backend/storage
chmod -R 775 /var/www/libroschool/backend/bootstrap/cache
chmod 640 /var/www/libroschool/backend/.env
```

### C. 环境变量模板

完整 `.env` 模板可在 `backend/.env.example` 中找到。

---

*文档版本: 1.0*  
*最后更新: 2025年*  
*维护者: LibroSchool 开发团队*
