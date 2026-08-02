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

## Production image ownership

Frontend CI builds the Next standalone runtime and, after successful CI,
publishes `ghcr.io/<namespace>/dzencode-frontend:<full-git-sha>` for
`linux/amd64`. Same-repository pull requests publish candidate SHAs; pushes to
main publish stable SHAs. Fork PRs never receive package-write capability.

This repository does not own SSH, VPS credentials, Compose or production
deployment. The backend repository is the trusted production control plane.
Its `frontend frontend-pr=<number>` target resolves an open PR to its current
head SHA or a merged PR to its merge SHA, validates exact-SHA Frontend CI and
the immutable package, then deploys it. Candidate deployment before merge and
final deployment after merge are separate explicit actions. A new PR commit
requires new CI, image publication and deployment request; no manual SHA is
accepted. The VPS only pulls this image and runs `node server.js`.
