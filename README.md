# Yongo

Публичный сайт разработчика: каталог услуг, заказ без оплаты, блог, CMS/CRM и закрытый брифинг для руководителей. Next.js 16, React 19, SQLite, тёмная glass-витрина.

План и ограничения: [`docs/development-plan.md`](docs/development-plan.md).

Подготовка к production, журнал исправлений, миграция и оставшиеся задачи: [`docs/production-security.md`](docs/production-security.md).

## Локально

Нужны Node 22 и Yarn 4 (`corepack enable`).

```bash
cp .env.example .env.local
# смените OWNER_EMAIL и OWNER_PASSWORD (12–256 символов)
yarn
yarn dev
```

Откройте [http://localhost:3000](http://localhost:3000). Админка: `/dashboard/login`.

```bash
yarn lint
yarn test:security
yarn build
yarn backup
```

`yarn backup` создаёт снимок SQLite и `storage/` в `data/backups/`, проверяет БД и хранит 7 завершённых снимков. На VPS настройте ежедневный запуск и зашифрованную копию вне сервера. Восстановление описано в production-инструкции.

Пароль существующего владельца меняется через `yarn owner:password owner@example.com` (скрытый ввод, отзыв всех сессий), а не изменением `.env.local`. Bootstrap из env выполняется только при пустой таблице users.

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

Порт 3000 доступен только на loopback. Настройте HTTPS через reverse proxy; примеры Nginx находятся в `deploy/nginx/`. После настройки приватного proxy, перезаписывающего `X-Real-IP`, установите `TRUST_PROXY=1`. Cookie `Secure` включается при `NODE_ENV=production`.

Manrope и Unbounded поставляются локальными Fontsource-пакетами: сборка и браузер не запрашивают Google Fonts.

Неиспользованные приглашения действуют 7 дней; принятый доступ — до отзыва. Uploads черновиков/архивов не выдаются анониму, закрытых черновиков — менеджеру. При смене канала public/internal вложения нужно загрузить заново.

## Postgres позже

DAL уже отделён (`src/data/*`). Смена драйвера Drizzle на `postgres` не требует новой CMS. Пока локально и на одном VPS достаточно SQLite + бэкап файла.

## Чего нет в этой версии

Онлайн-оплата, кабинет клиента, Nest.js и отдельный редактор кейсов в CMS.

## Портфолио

Три кейса доступны на `/work/[slug]`. Тексты, добавление скриншотов и безопасное обновление существующих шаблонов описаны в [`docs/portfolio.md`](docs/portfolio.md).
