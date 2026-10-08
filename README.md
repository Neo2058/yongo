# Yongo

Публичный сайт разработчика: каталог услуг, заказ без оплаты, блог, CMS/CRM и закрытый брифинг для руководителей. Next.js 16, React 19, SQLite, тёмная glass-витрина.

План и ограничения: [`docs/development-plan.md`](docs/development-plan.md).

## Локально

Нужны Node 22 и Yarn 4 (`corepack enable`).

```bash
cp .env.example .env.local
# смените OWNER_EMAIL и OWNER_PASSWORD (не короче 10 символов)
yarn
yarn dev
```

Откройте [http://localhost:3000](http://localhost:3000). Админка: `/dashboard/login`.

```bash
yarn lint
yarn build
yarn backup
```

`yarn backup` копирует `data/yongo.sqlite` в `data/backups/`. На VPS поставьте в cron раз в сутки.

## Почта

Заявка и заказ сначала пишутся в SQLite. Письмо владельцу — побочный эффект.

Если `SMTP_HOST` пустой, в логе будет `SMTP не настроен, запись уже в БД.` Запись не теряется.

## Docker / VPS

Это файловая SQLite-база. Нужен сервер с диском, не serverless.

```bash
mkdir -p data storage
sudo chown 1001:1001 data storage
cp .env.example .env.local
# SITE_URL=https://ваш-домен
# OWNER_PASSWORD — не example-значение
docker compose up --build -d
```

Проксируйте HTTPS на порт 3000. Cookie `Secure` включается при `NODE_ENV=production`.

## Postgres позже

DAL уже отделён (`src/data/*`). Смена драйвера Drizzle на `postgres` не требует новой CMS. Пока локально и на одном VPS достаточно SQLite + бэкап файла.

## Чего нет в этой версии

Онлайн-оплата, кабинет клиента, Nest.js и отдельный редактор кейсов в CMS.

## Портфолио

Три кейса доступны на `/work/[slug]`. Тексты, добавление скриншотов и безопасное обновление существующих шаблонов описаны в [`docs/portfolio.md`](docs/portfolio.md).
