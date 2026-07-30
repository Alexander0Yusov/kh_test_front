# Test Task frontend

Минимальный frontend-фундамент на Next.js App Router для дальнейшей разработки тестового приложения.

## Требования

- Node.js 20.9 или новее
- pnpm 10.13.1

## Запуск

```bash
pnpm install
pnpm dev
```

Frontend будет доступен по адресу `http://localhost:4200`. Для генерации
REST-контрактов backend API должен быть доступен по адресу
`http://localhost:3000/api`.

## REST-контракты и проверки

```bash
pnpm contracts:openapi
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

`BACKEND_URL` задаёт публичный base URL backend API. Значение читается сервером
во время выполнения и публикуется для browser-кода только через
`GET /api/runtime-config`. Локальный пример находится в `.env.example`;
для разработки его можно скопировать в игнорируемый `.env.local`.

`pnpm contracts:openapi` получает Swagger JSON из
`${BACKEND_URL}/docs-json` и обновляет generated REST-контракты.
