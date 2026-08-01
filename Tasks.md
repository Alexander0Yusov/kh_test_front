# FRONTEND IMPLEMENTATION PLAN

## Цель

Создать законченное frontend-приложение на Next.js для существующего backend-проекта.

Frontend должен обеспечивать:

- регистрацию и авторизацию;
- работу с access/refresh token flow;
- загрузку и предварительную обработку файлов;
- ожидание подтверждения загрузки через WebSocket;
- создание root-сообщений и ответов;
- CAPTCHA;
- получение сообщений через GraphQL;
- выбор возвращаемых GraphQL-полей;
- построение дерева сообщений;
- Cursor Pagination и Infinite Scroll;
- получение новых сообщений в реальном времени;
- точечное встраивание новых узлов без повторной загрузки всей страницы;
- демонстрационную полную очистку проекта;
- контейнерный запуск рядом с backend.

---

# 1. Правила выполнения проекта

- [ ] Перед каждым этапом читать этот `Tasks.md`.
- [ ] Выполнять задачи небольшими законченными вертикальными срезами.
- [ ] После фактического завершения менять `[ ]` на `[x]`.
- [ ] Не отмечать задачу выполненной без runtime-проверки.
- [ ] Незавершённые задачи помечать `PARTIAL` с кратким объяснением.
- [ ] Заблокированные задачи помечать `BLOCKED` с указанием причины.
- [ ] После каждого этапа актуализировать этот `Tasks.md`.
- [ ] Не выполнять commit и push без отдельного указания.
- [ ] Не редактировать вручную сгенерированные OpenAPI и GraphQL типы.
- [ ] Не дублировать публичные backend DTO вручную.
- [ ] Не импортировать исходный код backend во frontend.
- [ ] Использовать только публичные HTTP, GraphQL и WebSocket-контракты Gateway.
- [ ] Не добавлять frontend-прокси поверх backend API без доказанной необходимости.
- [ ] Не добавлять отдельный глобальный state manager поверх Zustand.
- [ ] Не использовать Apollo Client cache как второй источник состояния.
- [ ] Текстовые требования этого файла имеют приоритет над ранними wireframe-скриншотами при возникновении противоречий.
- [ ] Новые архитектурные решения и зависимости добавлять только при реальной необходимости.
- [ ] Все временные диагностические данные после runtime-проверки удалять через `DELETE /api/erase-all-data`.
- [ ] Перед завершением каждого этапа выполнять typecheck, lint, build и `git diff --check`.

---

# 2. Утверждённый технологический стек

## Framework

- [x] Использовать актуальную стабильную версию Next.js.
- [x] Использовать Next.js App Router.
- [x] Использовать React и TypeScript в strict mode.
- [x] Использовать Server Components по умолчанию.
- [x] Добавлять `"use client"` только интерактивным компонентам и providers.
- [x] Не превращать всё приложение в один глобальный Client Component.
- [x] Основной интерактивный экран реализовать как client workspace внутри серверного layout/page.
- [ ] Настроить standalone production build Next.js.

## State management

- [x] Использовать Zustand.
- [x] Использовать slice policy.
- [x] Каждый slice должен отвечать за отдельную область состояния.
- [x] Не хранить вычисляемые данные, если их можно получить selector-функцией.
- [x] Не хранить access token в `localStorage`.
- [x] Не хранить refresh token в JavaScript-доступном хранилище.

## UI

- [x] Использовать Radix UI Primitives для готовых accessible-решений.
- [x] Использовать Radix Dialog для модальных окон.
- [ ] Использовать Radix Checkbox для выбора GraphQL-полей.
- [ ] Использовать Radix RadioGroup или ToggleGroup для сортировки и направления.
- [ ] Использовать Radix Collapsible для управляемого состояния sidebar.
- [ ] Использовать Radix ScrollArea там, где он не конфликтует с Infinite Scroll.
- [ ] Использовать Radix Avatar, Tooltip и Separator по необходимости.
- [x] Использовать `lucide-react` для иконок.
- [x] Использовать Sonner для toast-уведомлений.

## Styling

- [x] Использовать Tailwind CSS.
- [x] Создать один центральный файл theme/configuration для всех цветов, шрифтов, размеров, border и transition.
- [x] Запретить дублирование hex-цветов по компонентам.
- [x] Использовать Nunito через `next/font`.
- [x] Использовать только размеры шрифта `12px`, `14px`, `16px`.
- [x] Не создавать дополнительные размеры шрифта без изменения требований.
- [x] Использовать фиксированную desktop-композицию шириной `1200px`.
- [x] Не разрабатывать отдельный mobile layout в рамках текущего ТЗ.

## Forms and validation

- [x] Использовать React Hook Form.
- [x] Использовать Zod.
- [x] Использовать `@hookform/resolvers`.
- [x] Создать отдельную Zod schema для каждой формы.
- [x] Ошибки формы показывать около соответствующих полей.
- [x] Серверные ошибки сопоставлять с полями формы по `field`, если backend его возвращает.
- [x] Добавить доступное управление видимостью password в Login через общий `PasswordInput`.
- [x] Добавить доступное управление видимостью password в Register через общий `PasswordInput`.

## Contracts

- [x] Генерировать REST-типы из Swagger/OpenAPI.
- [x] Использовать `openapi-typescript`.
- [x] Использовать `openapi-fetch` или эквивалентный строго типизированный клиент.
- [x] Генерировать GraphQL-типы через GraphQL Code Generator.
- [x] Использовать GraphQL Codegen Client Preset.
- [x] Хранить GraphQL operations в `.graphql` или типизированных document-файлах.
- [x] Сгенерированные артефакты хранить отдельно от handwritten-кода.
- [ ] Production build не должен требовать работающий backend, если generated contracts уже актуальны.

## Tree

- [ ] Использовать `@headless-tree/react` как headless-библиотеку дерева.
- [ ] Использовать библиотеку для accessibility, keyboard navigation и tree semantics.
- [ ] Не отдавать библиотеке управление backend-сортировкой root-сообщений.
- [x] Хранить сообщения нормализованно и передавать presentation adapter актуальный flat data source.
- [ ] Реализовать собственный детерминированный `upsertPostNode`.
- [x] Не создавать на frontend рекурсивную копию данных как второй источник истины.

## Files

- [x] Использовать `pica` для качественного resize JPEG/PNG.
- [x] Для GIF применить библиотеку, сохраняющую animation frames, frame delays и transparency.
- [ ] Рассмотреть связку `gifuct-js` + `gifenc`.
- [x] Загружать GIF-библиотеки лениво только при выборе GIF.
- [x] Не превращать animated GIF в статичное изображение.
- [ ] Использовать DOMPurify для дополнительной frontend-санитизации HTML сообщения.
- [ ] Backend остаётся окончательным источником истины для file и message validation.

## WebSocket

- [x] Использовать `socket.io-client`.
- [x] Создавать singleton connection на namespace.
- [x] Не создавать новое соединение при каждом render.
- [x] Корректно восстанавливать subscriptions после reconnect.
- [x] Удалять listeners при unmount.

## Verification

- [x] Исключить автоматические тесты и testing infrastructure из scope.
- [x] Не устанавливать testing-библиотеки и не создавать test scripts, mocks, fixtures или coverage.
- [ ] Проверять реальные пользовательские сценарии вручную через runtime/browser verification.

---

# 3. Backend-контракты, которые frontend обязан учитывать

## Base URL

- [x] Использовать единственную runtime-переменную `BACKEND_URL`.
- [x] Значение `BACKEND_URL` должно быть URL, доступным браузеру пользователя.
- [ ] Не использовать Docker service hostname как browser URL.
- [x] Создать Next.js runtime-config endpoint, который читает server-side `BACKEND_URL` и безопасно возвращает браузеру публичный backend URL.
- [x] Не использовать жёстко зашитый `NEXT_PUBLIC_BACKEND_URL`, если это потребует rebuild контейнера при смене окружения.
- [x] Валидировать `BACKEND_URL` при startup.
- [x] Создать `.env.example`.
- [x] Development example: `BACKEND_URL=http://localhost:3000/api`.

## Backend endpoints

- [ ] Swagger JSON: `GET /api/docs-json`.
- [ ] Swagger UI: `GET /api/docs`.
- [x] GraphQL: `POST /api/graphql`.
- [ ] Регистрация: `POST /api/users/register`.
- [ ] Login: `POST /api/auth/login`.
- [ ] Refresh: использовать существующий backend refresh endpoint из Swagger.
- [ ] Logout: использовать существующий backend logout endpoint из Swagger.
- [ ] Current User: `GET /api/users/me`.
- [ ] Запрос загрузки: `POST /api/files/upload-request`.
- [ ] CAPTCHA: `GET /api/posts/captcha`.
- [ ] Создание сообщения: `POST /api/posts`.
- [ ] Полная очистка: `DELETE /api/erase-all-data`.
- [ ] GraphQL queries: `posts` и `post(id: ID!)`.
- [ ] Files WebSocket namespace: `/files`.
- [ ] Posts WebSocket namespace: `/posts`.

## Auth contract

- [x] Login body содержит только `email` и `password`.
- [x] Login response содержит только `accessToken`.
- [x] Refresh token принимается и возвращается только через HttpOnly cookie.
- [x] Все auth-запросы выполнять с `credentials: "include"`.
- [x] Access token хранить только в памяти Zustand.
- [x] Access token передавать как `Authorization: Bearer <token>`.
- [ ] После перезагрузки страницы восстанавливать авторизацию через refresh.
- [ ] После refresh получать `/api/users/me`.
- [ ] При окончательном `401` очищать auth state.
- [x] Не показывать пользователю Session metadata.
- [x] Не запрашивать у пользователя `deviceId`, `deviceName` или IP.
- [x] Не декодировать JWT как источник полномочий.
- [ ] Серверная проверка token/session остаётся источником истины.

## User contract

- [x] Регистрация принимает `email`, `password`, `avatarFileId`.
- [x] Avatar при регистрации обязателен.
- [x] `/api/users/me` содержит `id`, login email и `avatarUrl`.
- [ ] User больше не содержит `userName` и `homePage`.

## Post contract

- [x] Создание root post выполняется без `parentId`.
- [ ] Создание reply выполняется с `parentId`.
- [x] Каждый root Post принимает собственные `userName`, `email`, `message`, `captchaId`, `captchaValue`.
- [x] `homePage` необязателен.
- [x] `attachmentFileId` необязателен.
- [x] UserName допускает только латинские буквы и цифры.
- [x] Email валидируется как email.
- [x] HomePage валидируется как абсолютный HTTP/HTTPS URL.
- [x] Разрешённые HTML-теги сообщения: `a`, `strong`, `i`, `code`.
- [x] Для `a` разрешены только `href` и `title`.
- [x] Не разрешать `script`, inline handlers, `style`, `class`, небезопасные URL schemes.
- [ ] Полная модель Post может содержать:
  - `id`;
  - `parentId`;
  - `rootId`;
  - `path`;
  - `message`;
  - `publishDate`;
  - `userName`;
  - `email`;
  - `homePage`;
  - `avatarUrl`;
  - `attachmentUrl`.

## CAPTCHA contract

- [x] CAPTCHA получать перед созданием сообщения.
- [x] CAPTCHA response содержит `captchaId` и PNG data URL.
- [x] CAPTCHA состоит из шести латинских букв/цифр.
- [x] CAPTCHA одноразовая.
- [ ] CAPTCHA действует 300 секунд.
- [x] После неправильного ответа получать новую CAPTCHA.
- [x] После успешного создания Post очищать CAPTCHA state.
- [x] Не сохранять CAPTCHA в localStorage.

## Files contract

- [ ] Максимальный размер любого исходного загружаемого файла: `102400` bytes.
- [ ] Разрешённые расширения: `.jpg`, `.jpeg`, `.png`, `.gif`, `.txt`.
- [ ] Не принимать другие типы через input `accept`.
- [ ] Дополнительно проверять расширение, MIME и размер в коде.
- [ ] Передавать файл напрямую в S3/LocalStack по Presigned POST.
- [ ] Не передавать бинарный файл через Gateway.
- [x] Подписываться на `files.subscribe` до начала Presigned POST upload.
- [x] Дожидаться `files.subscribed`.
- [x] После подписки выполнять загрузку.
- [x] Считать файл готовым после `files.uploaded`.
- [x] Не использовать `fileId` в Registration/Post до подтверждения.
- [ ] Backend sync-проверка остаётся окончательной защитой от race condition.
- [ ] Не реализовывать polling статуса файла при существующем WebSocket flow.

## Posts realtime contract

- [ ] Слушать `posts.created` в namespace `/posts`.
- [ ] Событие содержит placement metadata.
- [ ] Событие не содержит полной публичной модели Post.
- [ ] После проверки релевантности точечно запрашивать `post(id)` через GraphQL.
- [ ] Не перезапрашивать всю текущую страницу после каждого события.
- [ ] Не удалять существующий последний root при поступлении нового root.
- [ ] Не изменять текущий cursor после realtime insertion.
- [ ] Дубликаты событий должны быть безопасны.

---

# 4. Структура frontend-приложения

- [x] Создать Next.js App Router project.
- [x] Использовать `src/`.
- [ ] Организовать код по feature-oriented структуре.
- [ ] Создать приблизительную структуру:

  src/
  app/
  features/
  auth/
  captcha/
  files/
  maintenance/
  posts/
  entities/
  post/
  user/
  shared/
  api/
  config/
  hooks/
  lib/
  stores/
  styles/
  ui/
  widgets/
  app-header/
  options-sidebar/
  posts-canvas/
  modal-host/

- [ ] Не создавать искусственные Domain/Application/Infrastructure слои во frontend.
- [ ] Не помещать весь код в `app/`.
- [ ] Не создавать один огромный Zustand store-файл.
- [ ] Не создавать один огромный Posts component.
- [ ] Создать barrel exports только там, где они не создают circular dependencies.
- [x] Настроить path aliases.
- [ ] Запретить импорт feature internals через глубокие относительные пути.
- [ ] Разделить generated contracts и application view models.

---

# 5. Bootstrap Next.js

- [x] Инициализировать Next.js App Router с TypeScript.
- [x] Подключить pnpm.
- [x] Закрепить Node.js/package manager versions.
- [x] Включить strict TypeScript.
- [x] Настроить ESLint.
- [x] Настроить import ordering.
- [x] Настроить `typecheck`.
- [x] Настроить production build.
- [x] Подключить Tailwind CSS.
- [x] Подключить Nunito через `next/font`.
- [x] Настроить metadata приложения.
- [x] Создать root layout.
- [x] Создать client providers boundary.
- [x] Подключить Toaster один раз в providers.
- [x] Подключить ModalHost один раз в providers.
- [x] Не обращаться к `window`, `localStorage` и WebSocket во время SSR.
- [x] Исключить hydration mismatch.

---

# 6. Runtime configuration

- [x] Создать типизированный server-side config.
- [x] Валидировать `BACKEND_URL` как абсолютный HTTP/HTTPS URL.
- [x] Создать Route Handler для выдачи browser runtime config.
- [x] Возвращать только публично допустимые параметры.
- [x] Создать типизированное client-side получение runtime config.
- [x] Заблокировать API initialization до загрузки runtime config.
- [x] Показать контролируемую ошибку startup, если config недоступен.
- [x] Не выводить secrets в runtime config.
- [x] Не хранить backend URL в нескольких файлах.
- [ ] API client, GraphQL client и Socket.IO должны получать один и тот же base URL.

---

# 7. Design system

## Цвета

- [x] Создать semantic tokens на основе утверждённых цветов:
  - graphite: `#252526`;
  - background-primary: `#e3e3e3`;
  - background-secondary: `#858585`;
  - active-blue: `#007acc`.
- [x] Использовать graphite для текста и border на светлом фоне.
- [x] Использовать blue для active, focus и hover marker.
- [ ] Использовать alpha-варианты только через прозрачность.
- [x] Не добавлять произвольные несогласованные цвета.
- [ ] Проверить читаемость текста и focus states.

## Typography

- [x] Использовать только Nunito.
- [x] Создать tokens:
  - text-xs: `12px`;
  - text-sm: `14px`;
  - text-base: `16px`.
- [x] Не использовать другие размеры.
- [ ] Использовать font weight и spacing для визуальной иерархии.

## Geometry

- [x] Основной контейнер имеет фиксированную ширину `1200px`.
- [x] Разместить его по центру viewport.
- [ ] Header фиксирован внутри композиции.
- [ ] Основная рабочая область начинается ниже header.
- [ ] Posts canvas имеет собственные вертикальную и горизонтальную прокрутки.
- [ ] Sidebar находится справа.
- [ ] Tree indentation увеличивает горизонтальную ширину canvas, а не сжимает Post бесконечно.
- [ ] Создать единые tokens для border width, radius, spacing и transition.
- [x] Hover transition: `250ms`.
- [ ] Sidebar hide delay: `500ms`.
- [x] Уважать `prefers-reduced-motion`.

## Shared UI

- [ ] Создать Button variants.
- [ ] Создать Input.
- [ ] Создать Textarea.
- [ ] Создать FormField.
- [ ] Создать IconButton.
- [ ] Создать ControlSurface.
- [ ] Создать LoadingIndicator/Skeleton.
- [ ] Создать EmptyState.
- [ ] Создать ErrorState.
- [ ] Создать FileBadge.
- [ ] Создать reusable focus ring.
- [ ] Все интерактивные элементы должны быть доступны с клавиатуры.
- [ ] Не заменять semantic button/div без необходимости.

---

# 8. Layout

## Header

- [ ] Реализовать фиксированный header.
- [x] Слева разместить логотип `Test Task`.
- [ ] Рядом с логотипом разместить `Erase All`.
- [x] В центре разместить `Create Message`.
- [ ] Справа зарезервировать три стабильных места:
  - `Login`;
  - `Register`;
  - `Log Out`.
- [x] Для анонимного пользователя активны Login/Register.
- [x] Для авторизованного пользователя активен Log Out.
- [x] Показывать постоянный Session indicator: anonymous SVG, restoring placeholder или authenticated avatar с fallback.
- [ ] Не выполнять невалидные действия скрытыми обработчиками.
- [x] `Create Message` требует авторизацию.
- [x] Если анонимный пользователь нажал Create Message, открыть Login modal.

## Main area

- [ ] Слева разместить Posts Canvas.
- [ ] Справа разместить Options Sidebar.
- [ ] Сохранить композицию wireframe.
- [ ] Posts Canvas должен поддерживать vertical и horizontal scroll.
- [ ] Не использовать scroll всего `body` вместо рабочего canvas.
- [ ] Реализовать empty/loading/error states.

## Back to top

- [ ] Добавить кнопку `Back to top`.
- [ ] Кнопка управляет именно Posts Canvas.
- [ ] По нажатию выполнить `scrollTo({ top: 0, left: 0 })`.
- [ ] Обе полосы прокрутки должны возвращаться в крайнее левое/верхнее положение.
- [ ] Использовать smooth scroll, кроме режима reduced motion.

---

# 9. Options Sidebar

- [ ] Заголовок: `Options`.
- [ ] Секции должны идти строго в порядке:
  1. Sort By;
  2. Direction;
  3. Fields;
  4. Page Size.
- [ ] Sort By:
  - Date;
  - Email;
  - UserName.
- [ ] Direction:
  - ASC;
  - DESC.
- [ ] Fields:
  - Avatar;
  - Home Page;
  - Email;
  - File;
  - Date.
- [ ] UserName не выводить как checkbox: frontend GraphQL query всегда запрашивает его.
- [ ] Structural fields и message всегда запрашивать.
- [ ] Page Size по умолчанию `25`.
- [ ] Минимум Page Size: `1`.
- [ ] Максимум Page Size: `50`.
- [ ] Кнопки `+` и `-` изменяют значение на `1`.
- [ ] Деактивировать кнопки на границах.
- [ ] Использовать controlled Radix components.
- [ ] Изменение сортировки, направления, fields или page size сбрасывает frontend feed.
- [ ] После изменения правил начинать запрос с первой страницы без cursor.
- [ ] Идентичные настройки не должны вызывать reset.
- [ ] Sidebar плавно закрывается через 500ms после ухода мыши.
- [ ] Отмена таймера происходит при возврате мыши.
- [ ] Sidebar не должен закрываться во время взаимодействия клавиатурой внутри него.
- [ ] В закрытом состоянии оставить видимую arrow-button.
- [ ] По arrow-button sidebar плавно открывается.
- [ ] Реализовать поведение через Radix Collapsible и контролируемый timer.
- [ ] Не использовать modal Drawer, блокирующий Posts Canvas.

---

# 10. Custom useLocalStorage

- [ ] Реализовать generic `useLocalStorage<T>`.
- [ ] Hook должен быть SSR-safe.
- [ ] Не обращаться к localStorage до client hydration.
- [ ] Обрабатывать повреждённый JSON.
- [ ] Обрабатывать недоступность storage.
- [ ] Поддержать версионирование ключа.
- [ ] Синхронизировать изменения между browser tabs через `storage` event.
- [ ] Сохранять:
  - sortBy;
  - sortDirection;
  - selected fields;
  - page size;
  - sidebar preference.
- [ ] Не сохранять:
  - access token;
  - refresh token;
  - current user;
  - posts;
  - cursor;
  - CAPTCHA;
  - presigned URLs;
  - uploaded file IDs.
- [ ] При несовместимой версии preferences применять defaults.

---

# 11. Zustand architecture

## Session slice

- [x] Создать `sessionSlice`.
- [x] Поля:
  - `status: "idle" | "restoring" | "authenticated" | "anonymous" | "error"`;
  - `accessToken`;
  - `currentUser`;
  - `error`.
- [x] Actions: `beginRestore`, `setAuthenticated`, `setAnonymous`, `setSessionError`, `clearSession`.
- [x] Не хранить refresh token.

## Posts slice

- [x] Создать `postsSlice`.
- [x] Хранить entities как `Record<PostId, PostViewModel>`.
- [x] Отдельно хранить упорядоченный массив `rootIds`.
- [x] Не хранить nested `children[]` как второй источник истины.
- [x] Хранить:
  - cursor;
  - nextCursor;
  - hasMore;
  - loading state;
  - active request key;
  - error.
- [x] Actions текущего feed: `beginInitialLoad`, `replaceFeed`, `beginLoadMore`, `appendPage`, `setFeedError`, `resetFeed`.
- [ ] Добавить realtime actions `upsertPostNode` и `clearPosts` в соответствующем будущем срезе.
- [x] Дедупликация выполняется по Post ID.
- [x] Replies упорядочиваются по числовым сегментам `path`.
- [x] Root order задаётся backend sorting rules.
- [ ] Realtime insert не меняет cursor.

## Options slice

- [ ] Создать `optionsSlice`.
- [ ] Хранить sortBy, direction, fields, pageSize.
- [ ] Создать canonical query key.
- [ ] Нормализовать fields в стабильном порядке.
- [ ] Не считать перестановку одинаковых fields новым набором.
- [ ] Синхронизировать slice с `useLocalStorage`.

## Modal slice

- [x] Создать минимальный `modalSlice`.
- [x] Поддержать closed, `Login`, `Register`, `CreateRootPost` и request-scoped `AttachmentPreview(postId)`.
- [ ] В будущих срезах добавить modal kinds:
  - ReadAndReply;
  - AvatarPreview;
  - EraseConfirmation.
- [ ] Хранить sidebar state.
- [ ] Не хранить тяжёлые File/Blob в глобальном store без необходимости.

## Upload state

- [x] File upload state держать в feature hook/form state.
- [x] Не превращать каждый upload в глобальный Zustand slice.
- [x] Создать reusable `uploadFile` orchestration для avatar и attachment.
- [x] Создать явные состояния:
  - idle;
  - validating;
  - processing;
  - requesting;
  - subscribing;
  - uploading;
  - awaitingConfirmation;
  - uploaded;
  - failed.

---

# 12. API contract generation

## OpenAPI

- [x] Добавить script `contracts:openapi`.
- [x] Получать schema из `${BACKEND_URL}/docs-json`.
- [x] Генерировать REST types через `openapi-typescript`.
- [x] Сохранить generated file в `src/shared/api/generated/openapi.ts`.
- [x] Использовать generated `paths` в typed REST client.
- [x] Не создавать ручные копии Login/Register/CreatePost/Captcha/File DTO.
- [x] Добавить проверку, что generation не создаёт diff при неизменном backend contract.

## GraphQL

- [x] Добавить GraphQL Codegen config.
- [x] Получать development schema из `${BACKEND_URL}/graphql`.
- [x] Создать typed document `PublicPosts` для `posts`.
- [ ] Создать typed document для `post(id)` в realtime/detail срезе.
- [x] Генерировать TypeScript types и typed document nodes.
- [x] Не строить GraphQL selection строковой конкатенацией пользовательских значений.
- [x] Использовать fixed operation с boolean variables и directives.
- [x] Хранить необходимые generated artifacts для воспроизводимого build.
- [x] Добавить `contracts:graphql`.
- [ ] Добавить общий `contracts:generate`.
- [ ] Добавить `contracts:check`.

## Application clients

- [x] Создать REST client factory.
- [x] Создать GraphQL client.
- [ ] Создать общий `AppError`.
- [ ] Нормализовать REST DomainException.
- [ ] Нормализовать GraphQL errors с `extensions.code`, `field`, `details`.
- [x] Добавить AbortSignal support.
- [x] Не показывать пользователю raw stack traces.
- [ ] Не выполнять автоматический бесконечный retry мутаций.

---

# 13. JWT and session flow

- [x] При первом client mount выполнить один controlled restore flow.
- [x] Отправить refresh request с credentials.
- [ ] При успехе сохранить новый access token только в памяти.
- [ ] После этого получить `/api/users/me`.
- [x] Не показывать authenticated UI до завершения restore.
- [ ] Создать auth-aware REST wrapper.
- [ ] Добавлять access token только к защищённым запросам.
- [ ] При `401` выполнить не более одной согласованной refresh-попытки.
- [ ] Параллельные `401` должны ожидать один общий refresh promise.
- [ ] После успешного refresh повторить исходный запрос один раз.
- [ ] После неуспешного refresh очистить auth state.
- [x] Не создавать refresh loop.
- [x] Logout вызывает backend logout с credentials.
- [ ] После logout очистить access token, currentUser и закрыть защищённые формы.
- [ ] После logout публичный feed продолжает работать.
- [x] В toast не показывать токены или технические Session metadata.

---

# 14. Unified modal system

- [x] Создать один `ModalHost`.
- [x] Использовать Radix Dialog.
- [x] ModalHost принимает текущий modal kind.
- [x] Внутри одного shell рендерить Login, Register и Create Root forms.
- [ ] Добавить в тот же shell чтение/reply и file preview в будущих срезах.
- [x] Закрывать modal:
  - по крестику;
  - по Escape;
  - по ЛКМ на backdrop;
  - после успешного завершения соответствующего flow.
- [x] Backdrop: graphite с opacity 50%.
- [x] События backdrop не должны проходить к Posts Canvas.
- [x] Клики внутри Dialog Content не должны закрывать modal.
- [x] Focus trap обеспечен Radix Dialog; Create Root close возвращает focus на `Create Message`.
- [x] После закрытия возвращать focus инициирующей кнопке.
- [ ] PARTIAL — background interaction блокируется modal Radix Dialog; runtime-проверка заблокирована недоступной browser-сессией.
- [ ] Блокировать background scroll.
- [ ] Перед закрытием формы с введёнными данными показать подтверждение потери данных.
- [ ] Не показывать подтверждение для pristine form.
- [ ] Размер modal зависит от content kind, но shell остаётся общим.

---

# 15. File processing

## Validation

- [ ] Создать общую file schema.
- [x] Разрешить только JPG/JPEG, PNG, GIF, TXT.
- [x] Проверять extension и MIME для avatar images.
- [x] Отвергать empty file.
- [x] Итоговый файл перед upload не должен превышать `102400` bytes.
- [x] TXT больше лимита отклонять без обрезания.
- [x] Изображения больше `320x240` уменьшать с сохранением пропорций.
- [x] Никогда не растягивать маленькое изображение.
- [x] Не выполнять crop.
- [x] Не менять пропорции.
- [x] Сохранять исходный формат, если это технически возможно.
- [x] Не скрывать неуспешную обработку.

## JPEG/PNG

- [x] Читать dimensions до обработки.
- [x] Вычислять bounding box максимум `320x240`.
- [x] Использовать Pica.
- [x] После resize проверить итоговый размер.
- [x] При необходимости применять контролируемое quality reduction.
- [x] Не удалять PNG transparency.
- [x] Если невозможно получить файл до 100 KiB без неприемлемой потери/смены формата, показать ошибку.

## GIF

- [x] Определять animated GIF.
- [x] Сохранять все animation frames.
- [x] Сохранять frame delay.
- [x] Сохранять loop information.
- [x] Сохранять transparency.
- [x] Масштабировать каждый frame в одинаковый bounding box.
- [x] Не превращать GIF в статичный кадр.
- [ ] Выполнять тяжёлую обработку вне основного UI-потока, если измерения показывают заметную блокировку.
- [x] Лениво загружать GIF-processing bundle.
- [ ] PARTIAL — animated GIF pipeline реализован, но browser runtime-проверка недоступна без in-app browser session.

## Preview

- [x] Для image создавать preview через object URL.
- [x] Освобождать object URL через `URL.revokeObjectURL`.
- [x] Показывать filename, type, dimensions и size.
- [x] Для TXT читать содержимое через File API.
- [x] Рендерить TXT preview только как plain text.
- [x] Использовать `white-space: pre-wrap`.
- [x] Никогда не интерпретировать TXT как HTML.
- [x] Красиво показывать состояние готового файла.
- [x] Позволить заменить выбранный файл до submit.
- [x] Позволить удалить выбранный файл из формы.

---

# 16. Presigned upload and Files WebSocket

- [x] Browser runtime: Registration and avatar upload complete successfully with the corrected request-scoped WebSocket listener ordering.

## Avatar upload and registration flow

- [x] Request a Presigned POST and obtain `fileId`, upload URL and form fields.
- [x] Register the request-scoped `files.uploaded` expectation for the exact `fileId` before subscribing or uploading to storage.
- [x] Register the request-scoped `files.subscribed` listener before emitting `files.subscribe`.
- [x] Emit `files.subscribe` for the exact `fileId`.
- [x] Wait for the matching `files.subscribed` event before starting the storage upload.
- [x] Upload the processed avatar through the Presigned POST.
- [x] Preserve an early `files.uploaded` result if it arrives while the Presigned POST request is still pending.
- [x] Start the processing timeout only for an unresolved upload expectation.
- [x] Await the already-created `files.uploaded` expectation after the storage request succeeds.
- [x] Continue registration only after the matching file reaches `UPLOADED`.
- [x] Submit registration with the confirmed `avatarFileId`.
- [x] Confirm successful registration and the File transition from `UPLOADED` to `USED`.
- [x] Cancel request-scoped expectations on subscription, storage, reset or unmount failures.
- [x] Remove only the listener and timeout owned by the completed request.
- [x] Ignore foreign, malformed and duplicate WebSocket events.
- [x] Keep one shared Socket.IO connection without creating a socket per upload.

> **Critical ordering invariant:** To prevent upload events from being lost, the request-scoped `files.subscribed` listener must be registered before emitting `files.subscribe`, and the request-scoped `files.uploaded` listener must be registered before the Presigned POST begins. The backend may process the S3 object and emit `files.uploaded` while the browser is still awaiting the storage response. The expectation must therefore preserve an early event until the upload flow awaits its Promise.

- [x] **Subscription race:** never emit `files.subscribe` before installing the matching `files.subscribed` listener.
- [x] **Processing race:** never begin the Presigned POST before installing the matching `files.uploaded` listener.
- [x] Создать singleton Socket.IO client для `/files`.
- [x] Запросить upload request у Gateway.
- [x] Получить fileId, uploadUrl и uploadFields.
- [x] Отправить `files.subscribe` с fileId.
- [x] Дождаться `files.subscribed`.
- [x] Только после подтверждения комнаты выполнить Presigned POST.
- [x] Сформировать FormData из uploadFields.
- [x] Добавить File в FormData.
- [x] Не задавать multipart boundary вручную.
- [x] Проверить успешный S3 HTTP status.
- [x] После S3 success перейти в `awaitingConfirmation`.
- [x] Дождаться `files.uploaded` для соответствующего fileId.
- [x] Игнорировать уведомления других fileId.
- [x] После подтверждения сохранить fileId в конкретной форме.
- [x] После unmount убрать room listeners.
- [x] При reconnect повторно подписываться только на незавершённые uploads.
- [x] Добавить timeout UI без polling.
- [x] При timeout позволить пользователю повторить upload flow.
- [x] Не создавать несколько Post/User из-за повторного WebSocket события.
- [x] Проверить реальную загрузку через LocalStack.
- [ ] Проверить browser CORS для Presigned POST/GET.
- [ ] Если S3 CORS блокирует прямой browser flow, исправить минимальную bucket CORS-конфигурацию backend infrastructure; не создавать frontend binary proxy.

---

# 17. Registration

- [x] Реализовать Register modal.
- [ ] Поля:
  - email;
  - password;
  - avatar.
- [ ] Не добавлять userName.
- [ ] Не добавлять homePage.
- [ ] Не добавлять deviceId/deviceName.
- [x] Avatar обязателен.
- [x] Применить frontend file processing.
- [x] Дождаться `files.uploaded`.
- [x] После подтверждения отправить registration с avatarFileId.
- [x] Показать upload progress states.
- [x] После успешной регистрации показать toast.
- [x] Не выполнять автоматический login, если это отдельно не определено backend-контрактом.
- [x] Очистить form и file preview после success.
- [x] Обработать duplicate email.
- [x] Обработать invalid/used avatar.
- [x] Обработать backend unavailable.

---

# 18. Login and Logout

- [ ] PARTIAL — Login modal реализован; invalid/positive submit runtime заблокирован остановленным backend и недоступной browser-сессией.
- [x] Поля только email/password.
- [x] Выполнять запрос с credentials.
- [x] Сохранять access token только в memory state.
- [ ] PARTIAL — получение current user реализовано через generated `/users/me`, positive runtime не выполнен без зарегистрированного User/backend.
- [ ] Закрывать modal после успеха.
- [x] Показывать toast.
- [ ] PARTIAL — Logout реализован; runtime logout flow не выполнен без authenticated Session/backend.
- [ ] Logout должен очищать backend refresh cookie.
- [ ] Logout должен очищать auth slice.
- [ ] Login/Register кнопки не должны требовать лишних Session metadata.
- [x] Проверить login → refresh → restore current user → logout flow через реальный backend integration.

---

# 19. Message validation

- [x] Создать frontend Post Zod schema.
- [x] `userName` обязателен.
- [x] Разрешить только `[A-Za-z0-9]`.
- [x] `email` обязателен и валиден.
- [x] `homePage` необязателен и валиден как HTTP/HTTPS URL.
- [x] `message` обязателен.
- [x] `captchaValue` обязателен.
- [x] Реализовать frontend sanitization через DOMPurify.
- [x] Разрешить только:
  - `a`;
  - `strong`;
  - `i`;
  - `code`.
- [x] Для `a` разрешить только `href` и `title`.
- [x] Разрешить только безопасные URL protocols.
- [x] Отклонять event handlers и неизвестную разметку.
- [x] Отклонять style/class/target.
- [x] После sanitization проверять, что сообщение не стало пустым.
- [x] Показывать пользователю разрешённые теги.
- [ ] Добавить preview sanitized message.
- [x] Backend validation остаётся обязательной и окончательной.
- [x] Не считать frontend sanitization security boundary.

---

# 20. CAPTCHA UI

- [x] При открытии Create Root form получить CAPTCHA.
- [x] Показать CAPTCHA image без извлечения ответа.
- [x] Показать поле ввода.
- [x] Добавить кнопку refresh CAPTCHA.
- [x] При refresh старое captchaId больше не использовать.
- [x] После `INVALID_CAPTCHA` автоматически запросить новую CAPTCHA.
- [x] Очистить captchaValue.
- [x] Показать понятное сообщение.
- [x] Не логировать CAPTCHA.
- [x] Не сохранять CAPTCHA.
- [x] Не переиспользовать CAPTCHA после submit.
- [x] Добавить loading/error state при недоступном Redis/Gateway.

---

# 21. Create root and reply flow

- [ ] Использовать одну MessageForm.
- [x] Root mode не передаёт optional `parentId`.
- [ ] Reply mode передаёт выбранный Post ID как parentId.
- [x] Root form содержит поля:
  - message;
  - userName;
  - homePage;
  - email;
  - optional attachment;
  - CAPTCHA.
- [x] Для attachment использовать общий `uploadFile` flow.
- [x] Не отправлять Post до подтверждения attachment.
- [x] Не добавлять attachmentFileId, если файла нет.
- [x] Submit защищён от двойного клика.
- [x] После HTTP 201 выполнить point `getPost` и upsert полного root в store.
- [ ] Повторное `posts.created` не должно дублировать Post.
- [x] После success закрыть modal и показать toast.
- [x] После ошибки сохранить введённый message, кроме одноразовой CAPTCHA.
- [x] При ошибке CAPTCHA обновить только CAPTCHA.
- [x] При ошибке attachment сохранить controlled error и возможность заменить файл.

---

# 22. GraphQL field selection

- [ ] Использовать GraphQL для чтения feed и отдельного Post.
- [x] REST оставить для auth, uploads, CAPTCHA, create Post и maintenance.
- [x] Базовые GraphQL-поля всегда запрашивать:
  - id;
  - parentId;
  - rootId;
  - path;
  - message;
  - userName.
- [x] Подготовить boolean selection variables для будущих checkbox optional-полей:
  - avatarUrl;
  - homePage;
  - email;
  - attachmentUrl;
  - publishDate.
- [x] Использовать GraphQL `@include` с boolean variables.
- [x] Не строить query через небезопасную строковую конкатенацию.
- [x] Не требовать email/publishDate в response только потому, что по ним выполняется backend sorting.
- [x] Backend может сортировать по полям, отсутствующим в GraphQL response.
- [x] Cursor остаётся гарантией правильного порядка.
- [x] Frontend не пересортировывает backend page повторно.
- [x] UserName остаётся обязательным для интерфейса.
- [ ] При снятии Avatar/File не выполнять лишние запросы за URL.
- [ ] Изменение selection полностью сбрасывает текущий feed.
- [ ] Повторный запрос начинается без cursor.
- [ ] Одинаковая canonical selection продолжает pagination.

---

# 23. Cursor Pagination and Infinite Scroll

- [x] Получать default feed с `createdAt DESC`, limit 25.
- [x] Передавать sortBy, sortDirection, limit и selected fields.
- [x] Cursor считать opaque string.
- [x] Никогда не редактировать cursor на frontend.
- [x] Никогда не декодировать cursor для бизнес-логики.
- [x] Сохранять nextCursor только для текущего request generation.
- [x] При reset аннулировать старый cursor.
- [x] Реализовать IntersectionObserver sentinel.
- [x] Запрашивать следующую страницу только если `hasMore=true`.
- [x] Не запускать параллельно два одинаковых page request.
- [x] Использовать AbortController.
- [ ] Отменять старый запрос при смене options.
- [x] Не применять response устаревшего request generation.
- [x] Merge выполнять без дублей.
- [x] Infinite Scroll пагинирует root families, а не отдельные child nodes.
- [x] Replies, пришедшие с root tree, не влияют на page size.
- [x] Показать нижний loading indicator.
- [ ] Показать end-of-feed state.
- [x] Retry не должен сбрасывать уже загруженные страницы.

---

# 24. Tree model

- [x] Использовать flat backend response.
- [x] Построить derived flat-to-tree presentation adapter.
- [x] Root Post определяется `parentId === null`.
- [x] Reply привязывается по `parentId`.
- [x] Для root использовать backend root order.
- [x] Для children использовать числовое сравнение path segments.
- [x] `1.10` должен располагаться после `1.2`.
- [x] Не сортировать path как обычную строку.
- [ ] Использовать Headless Tree с controlled data source.
- [ ] Обеспечить keyboard navigation.
- [x] Обеспечить базовые ARIA tree roles/levels.
- [ ] Поддержать динамический `upsertPostNode`.
- [ ] Если parent ещё отсутствует, временно удерживать orphan node и присоединить после появления parent.
- [ ] Не показывать reply, если его root family не загружено.
- [ ] Не создавать дубль при повторном событии.
- [ ] Не выполнять рекурсивную мутацию существующих объектов.

---

# 25. Post card

## Structure

- [ ] Post визуально состоит из двух строк.
- [ ] Первая строка имеет строгий порядок:
  1. Avatar;
  2. UserName;
  3. HomePage;
  4. Email;
  5. Attached File.
- [x] Если Date выбрана, показывать её строго справа после attachment в формате `dd.MM.yyyy-HH:mm` для `Europe/Kyiv`.
- [ ] Вторая строка содержит только message preview.
- [ ] Message preview отображается одной строкой с ellipsis.
- [ ] Полный текст открывается в ReadAndReply modal.
- [x] Отступ слева использует точную формулу `depth * 20px` без сжатия card.
- [x] Root PostCard занимает `50%` feed row и остаётся прижатой слева.
- [ ] Глубокое дерево расширяет canvas по горизонтали.

## Remaining zones

- [ ] Клик по свободной зоне Post открывает ReadAndReply modal.
- [ ] Клик по message preview открывает ReadAndReply modal.
- [ ] Hover свободной зоны показывает blue border.
- [ ] Transition `250ms`.
- [ ] Cursor pointer.
- [x] Copy и attachment controls изолированы от будущего Post modal action.
- [x] Использовать `stopPropagation` только на реальных вложенных controls.

## Controls

- [ ] Avatar click открывает AvatarPreview modal.
- [x] UserName показывает первые 10 Unicode code points без изменения source value.
- [x] Reusable accessible Copy control копирует полный userName через Clipboard API и показывает toast.
- [x] HomePage показывает первые 10 Unicode code points либо muted `[HomePage]` без навигации.
- [x] Существующий HomePage копируется полностью без открытия URL.
- [x] Email показывает первые 10 Unicode code points и копируется полностью без `mailto:`.
- [x] Attachment button открывает единый AttachmentPreview modal без прямой навигации.
- [x] Copy и attachment controls имеют hover/focus blue border, `250ms` transition, pointer cursor и keyboard semantics.
- [ ] Links внутри message не должны открывать ReadAndReply modal.
- [ ] Внешним ссылкам добавить безопасные `rel` attributes.

## Safe HTML

- [ ] Создать `SafeMessageHtml`.
- [ ] Повторно санитизировать backend HTML через DOMPurify перед render.
- [ ] Использовать точный whitelist.
- [ ] Изолировать единственное допустимое использование `dangerouslySetInnerHTML`.
- [ ] Не рендерить произвольный HTML напрямую.

---

# 26. Read and Reply modal

- [ ] Верхняя часть показывает полный выбранный Post.
- [ ] Показать полный sanitized message.
- [ ] Показать выбранные author fields.
- [ ] Показать attachment control.
- [ ] Нижняя часть содержит Reply form.
- [ ] Показать разрешённые HTML tags.
- [ ] Reply form использует собственные userName/email/homePage.
- [ ] Reply form не копирует автоматически автора parent Post.
- [ ] Reply form получает новую CAPTCHA.
- [ ] Reply attachment необязателен.
- [ ] После создания reply точечно встроить node.
- [ ] Не перезапрашивать всё дерево.
- [ ] Если выбранный Post исчез/не найден, показать controlled 404 state.

---

# 27. File preview modal

- [x] Attachment preview хранит в modal state только `postId` и читает актуальный Post из normalized store.
- [x] Тип определяется case-insensitive по URL pathname без анализа query string.
- [x] Для изображений показывать исходный uploaded asset без навигации или object URL.
- [x] Сохранять пропорции и animation GIF.
- [x] Не растягивать сверх доступного modal viewport.
- [x] Для TXT получать содержимое прямым `fetch` по opaque URL без Authorization.
- [x] TXT fetch использует AbortController и cleanup при закрытии/unmount.
- [x] Показывать TXT как plain text.
- [x] Добавить internal scroll для длинного TXT.
- [x] Не интерпретировать HTML из TXT.
- [ ] Показать filename, если он доступен frontend state.
- [ ] Для backend attachment без filename использовать нейтральную подпись.
- [ ] Добавить download/open-original action.
- [ ] Обработать истёкший presigned URL контролируемо.
- [ ] Если URL истёк, точечно повторно запросить `post(id)` с attachment field.
- [ ] Не перезапрашивать весь feed.
- [ ] PARTIAL — image/TXT modal, clipboard, focus return и visual width требуют browser runtime; in-app browser недоступен в текущей сессии.

---

# 28. Posts WebSocket and realtime insertion

- [ ] Создать singleton Socket.IO client для `/posts`.
- [ ] Подключать его после загрузки runtime config.
- [ ] Слушать `posts.created`.
- [ ] Валидировать event через Zod.
- [ ] Malformed event игнорировать с controlled log.
- [ ] Не доверять event как полной Post-модели.
- [ ] Проверять `postId`, `parentId`, `rootId`, sort metadata.

## Reply event

- [ ] Если это reply и его rootId загружен, запросить `post(id)` через GraphQL.
- [ ] Запрашивать только текущие selected fields.
- [ ] Встроить reply через `upsertPostNode`.
- [ ] Если rootId не загружен, не выполнять HTTP/GraphQL request.
- [ ] Не создавать массовый запрос от всех клиентов для невидимого дерева.

## Root event

- [ ] Определить, может ли новый root принадлежать текущему загруженному диапазону.
- [ ] Использовать текущий sortBy, direction и tie-breaker Post ID.
- [ ] Для sortBy `createdAt` использовать publishDate из event.
- [ ] Для sortBy `userName` использовать userName из event.
- [ ] Для sortBy `email` использовать email из event.
- [ ] Если root должен находиться до/внутри уже загруженного диапазона, запросить `post(id)` и вставить.
- [ ] Не удалять последний существующий root.
- [ ] Если новый root находится после текущей границы и `hasMore=true`, не запрашивать его сейчас.
- [ ] Если `hasMore=false` и root относится к продолжению последней страницы, запросить и добавить.
- [ ] Realtime roots могут временно увеличить число отображаемых roots сверх page size.
- [ ] Следующий cursor request продолжает путь от прежнего server boundary.
- [ ] Не менять nextCursor из-за realtime insertion.
- [ ] Merge следующей страницы дедуплицирует уже вставленные realtime nodes.

## Reliability

- [ ] Повторное событие не вызывает duplicate node.
- [ ] Если Post уже загружен, не выполнять повторный GraphQL request.
- [ ] При reconnect не очищать feed.
- [ ] При временной недоступности GraphQL показать ненавязчивый toast.
- [ ] Не создавать бесконечный realtime retry.
- [ ] Проверить два WebSocket-клиента runtime-тестом.

---

# 29. Maintenance: Erase All

- [ ] Реализовать кнопку `Erase All`.
- [ ] Кнопка открывает confirmation modal.
- [ ] Показать сигнальную иконку `⚠️`.
- [ ] Показать предупреждение:

  ⚠️ Этот функционал реализован исключительно для удобства сброса и презентации тестового проекта. Он необратимо удаляет все записи приложения, загруженные файлы и временные ресурсы проекта. Подобный открытый механизм категорически запрещено реализовывать или публиковать в production business system.

- [ ] Требовать явное подтверждение.
- [ ] Не выполнять erase по первому клику.
- [ ] После подтверждения вызвать `DELETE /api/erase-all-data`.
- [ ] Ожидать HTTP 204 без body.
- [ ] На время запроса заблокировать повторный submit.
- [ ] После success очистить Posts store.
- [ ] Очистить current forms/uploads/CAPTCHA.
- [ ] Очистить только относящиеся к приложению localStorage preferences при выбранном product decision; по умолчанию UI preferences сохранить.
- [ ] Auth state очистить, так как backend User/Session удалены.
- [ ] Показать success toast.
- [ ] При 503 не очищать frontend state до подтверждённого backend success.

---

# 30. Error handling and toaster

- [ ] Создать единый error mapper.
- [ ] Validation errors отображать у полей.
- [ ] Infrastructure errors отображать toast.
- [ ] Успех upload/register/login/logout/create/erase отображать toast.
- [ ] Не показывать два одинаковых toast для одной ошибки.
- [ ] Не показывать raw gRPC/Prisma/AWS/RabbitMQ details.
- [ ] Поддержать error codes:
  - VALIDATION_FAILED;
  - INVALID_CAPTCHA;
  - NOT_FOUND;
  - ALREADY_EXISTS;
  - PAYLOAD_TOO_LARGE;
  - UNSUPPORTED_MEDIA_TYPE;
  - SERVICE_UNAVAILABLE;
  - UNAUTHORIZED.
- [ ] Unknown error показывать нейтрально и логировать correlation info, если оно доступно.
- [ ] Toast доступен screen reader.
- [ ] Toast не должен блокировать modal controls.

---

# 31. Loading and concurrency

- [ ] Разделить auth restoring, feed loading, next page loading, upload loading и mutation loading.
- [ ] Не блокировать весь экран при загрузке следующей страницы.
- [ ] Не блокировать публичный feed при недоступной CAPTCHA.
- [ ] Не блокировать REST/GraphQL UI при временно недоступном WebSocket.
- [ ] Не создавать duplicate requests в React Strict Mode.
- [ ] Использовать request IDs/canonical keys.
- [ ] Игнорировать late response после options reset.
- [ ] Защитить submit actions от double click.
- [ ] Освобождать AbortController/listeners/timers/object URLs.

---

# 32. Accessibility

- [ ] Все формы имеют labels.
- [ ] Ошибки связаны с полями через ARIA.
- [ ] Dialog имеет title и description.
- [ ] Icon-only buttons имеют accessible name.
- [ ] Tree поддерживает keyboard navigation.
- [ ] Sidebar доступен без мыши.
- [ ] Hover states имеют соответствующий focus-visible state.
- [ ] Не полагаться только на цвет.
- [ ] Проверить focus order.
- [ ] Проверить Escape behavior.
- [ ] Проверить backdrop click.
- [ ] Проверить, что background не получает событие.
- [ ] Проверить reduced motion.
- [ ] Проверить контраст утверждённой палитры.
- [ ] Там, где `#858585` не обеспечивает достаточный контраст для мелкого текста, использовать его как background/border, а текст выбирать из утверждённой контрастной пары.

---

# 33. Docker

- [ ] Создать multi-stage Dockerfile.
- [ ] Использовать Next.js standalone output.
- [ ] Запускать production server не от root.
- [ ] Создать `.dockerignore`.
- [ ] Добавить healthcheck.
- [ ] Добавить frontend service в отдельный/соседний Compose project согласно структуре репозиториев.
- [ ] Не копировать backend исходники во frontend image.
- [ ] Передавать `BACKEND_URL` в runtime environment контейнера.
- [x] Смена `BACKEND_URL` не должна требовать изменения frontend-кода.
- [x] По возможности смена `BACKEND_URL` не должна требовать rebuild image.
- [x] Browser должен получать публично достижимый backend URL через runtime config.
- [x] Настроить frontend port.
- [x] Документировать local start.
- [ ] Документировать container start.
- [ ] Проверить взаимодействие frontend container → browser → Gateway.
- [ ] Проверить WebSocket upgrade.
- [ ] Проверить credentials/cookie flow.
- [ ] Проверить backend CORS с точным frontend origin.
- [ ] Не включать development tools в production image.

---

# 34. Security

- [ ] Refresh token остаётся только в HttpOnly cookie.
- [ ] Access token хранится только в memory.
- [ ] Не хранить tokens в localStorage/sessionStorage.
- [ ] Все credential requests используют `credentials: include`.
- [ ] Не выводить tokens в console.
- [ ] Не выводить CAPTCHA в console.
- [ ] Не выводить presigned POST fields в production logs.
- [ ] Повторно санитизировать HTML перед render.
- [ ] TXT рендерить только как text.
- [ ] Внешние ссылки валидировать.
- [ ] Использовать `rel="noopener noreferrer"` для новых вкладок.
- [ ] Не доверять MIME из browser input.
- [ ] Ограничения frontend не заменяют backend validation.
- [x] Runtime config не содержит secrets.
- [ ] Erase endpoint явно обозначить как демонстрационно опасный.
- [ ] Не добавлять Service Worker caching для auth/API responses без отдельного решения.

---

# 35. Manual runtime verification

- [ ] Запустить PostgreSQL, LocalStack, RabbitMQ, Redis и backend services.
- [x] Запустить frontend.
- [x] Открыть приложение в browser.
- [x] Проверить Swagger type generation.
- [x] Проверить GraphQL type generation и повторную детерминированную generation.
- [x] Зарегистрировать диагностического User с avatar через реальный backend integration.
- [x] Убедиться, что Presigned POST подтверждён через `files.uploaded`.
- [x] Выполнить login и `/users/me` через реальный backend integration.
- [ ] PARTIAL — refresh и повторный `/users/me` проверены integration; browser reload недоступен без in-app browser session.
- [x] Создать root без attachment.
- [x] Создать root с image attachment.
- [x] Создать root с TXT attachment.
- [ ] Создать reply.
- [ ] Создать nested reply.
- [ ] Убедиться, что CAPTCHA одноразовая.
- [x] Убедиться, что неправильная CAPTCHA обновляется.
- [x] Проверить allowed HTML.
- [x] Проверить отклонение unsafe HTML.
- [ ] PARTIAL — GraphQL request и selection variables проверены; backend вернул пустой `items`, поэтому отображение metadata не подтверждено данными.
- [ ] Проверить sorting Date/Email/UserName ASC/DESC.
- [ ] Проверить page size 1/25/50.
- [ ] PARTIAL — infinite scroll реализован; в backend нет второй cursor-страницы для runtime-проверки.
- [x] Проверить отсутствие дублей после immediate root insertion.
- [ ] Проверить realtime root.
- [ ] Проверить realtime reply видимого дерева.
- [ ] Проверить отсутствие запроса для reply невидимого дерева.
- [ ] Проверить realtime insertion + последующую cursor page.
- [ ] Проверить Avatar modal.
- [ ] Проверить image attachment modal.
- [ ] Проверить TXT attachment modal.
- [ ] Проверить Back to top left+top.
- [ ] Проверить sidebar timer.
- [ ] Проверить второй browser client.
- [ ] Проверить logout.
- [ ] Проверить Erase All.
- [ ] Проверить повторный Erase All.
- [ ] После проверки убедиться, что backend business data очищены.

---

# 36. Quality gates

- [x] `pnpm typecheck` проходит.
- [x] `pnpm lint` проходит.
- [x] `pnpm build` проходит.
- [ ] PARTIAL — anonymous restore, открытие modal, внутренний click, X и возврат focus проверены; полный browser flow заблокирован недоступной browser-сессией и остановленным backend.
- [x] `git diff --check` проходит.
- [x] Generated OpenAPI types актуальны.
- [x] Generated GraphQL types актуальны.
- [x] Нет вручную продублированных backend DTO.
- [x] Нет tokens в browser storage.
- [ ] PARTIAL — application/hydration errors отсутствуют; ожидаемый HTTP 401 refresh отображался браузером как network console error.
- [x] Нет React hydration warnings.
- [ ] Нет незакрытых Socket.IO listeners.
- [x] Нет неосвобождённых object URLs в attachment preview lifecycle.
- [x] Нет N+1 frontend requests за avatar/attachment.
- [ ] Нет full feed reload после `posts.created`.
- [ ] Production container healthy.
- [x] Runtime `BACKEND_URL` используется REST, GraphQL и Files Socket.IO transports.
- [ ] README содержит local/container start.
- [x] Tasks.md соответствует фактическому состоянию.

---

# 37. Итоговый Definition of Done

Frontend считается завершённым, когда:

- [ ] Next.js приложение запускается локально и в отдельном контейнере.
- [ ] Backend URL задаётся одной runtime environment variable.
- [ ] Регистрация работает с обязательным avatar.
- [ ] Login требует только email/password.
- [ ] Refresh token остаётся HttpOnly.
- [ ] Access token хранится только в памяти.
- [ ] Session восстанавливается после reload.
- [ ] Logout работает.
- [ ] Root и reply создаются.
- [ ] CAPTCHA работает.
- [ ] JPG/JPEG/PNG/GIF/TXT обрабатываются по требованиям.
- [ ] Изображения ограничиваются `320x240`.
- [ ] Animated GIF не становится статичным.
- [ ] Любой итоговый upload не превышает 100 KiB.
- [ ] Подтверждение upload приходит через WebSocket.
- [x] Feed загружается через GraphQL.
- [ ] Checkboxes реально управляют GraphQL selection.
- [x] UserName всегда включён в canonical query и отображается Post card.
- [ ] PARTIAL — Cursor Pagination и Infinite Scroll реализованы, но backend не содержит второй страницы для runtime-проверки.
- [x] Tree строится из flat response.
- [x] Локально созданный root встраивается без reload и полного GraphQL refetch.
- [ ] Realtime events не создают дубли.
- [x] Post card соответствует двухстрочной композиции.
- [x] Hover/focus behavior соответствует требованиям.
- [x] Modal system единый для Login, Register и Create Root.
- [ ] Sidebar плавно закрывается и открывается.
- [ ] Back to top возвращает обе полосы прокрутки.
- [ ] Image/TXT previews работают.
- [ ] Erase All работает и содержит явное production warning.
- [ ] Swagger/OpenAPI и GraphQL типы генерируются.
- [ ] Typecheck, lint и build проходят.
- [ ] Runtime-проверка выполнена на реальном backend.

## Deferred hardening backlog

- [ ] Add durable File status reconciliation after WebSocket timeout or reconnect.
  - WebSocket remains the primary realtime mechanism.
  - Future reconciliation is a safety net for a genuinely lost at-most-once WebSocket frame and must not replace the normal WebSocket flow.
  - It is deferred for this test project and does not block the current frontend business slices.
  - A status endpoint, polling and retries are not implemented in the current slice.
