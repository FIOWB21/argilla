# PROGRESS.md — журнал выполнения и продолжения между чатами

**Проект:** Argilla v2.8.0 — shortcuts `1/2/3` после клика мышью вне вариантов ответа **на той же записи**.
**Дата актуализации задания:** 2026-11-07.
**Статус:** Шаг 5 PARTIAL — комплект переноса готов и синхронизирован с GitHub; фактическая отправка администратору и решение о PR остаются пользователю. Локальная приёмка PASS. Полный промежуточный Chromium/WebKit: 53 PASS / 1 SKIP; финальная очередь: 2 PASS; Jest 510 PASS / 2 прежних SKIP; линтер PASS. Полная ручная матрица и корпоративный браузер не подтверждены; Firefox 132 BLOCKED из-за исходного CSS.highlights. Корпоративная установка не менялась.
**Текущий этап:** Передача пользователем готового [комплекта](./PATCH_HANDOFF.md) администратору; опциональный шаг 6 — только после staging и отдельного согласования внедрения.

## Уточнённый scope (НЕ ПЕРЕПУТАТЬ)

- Ошибка происходит после **клика мышью по фону/обычному тексту**, когда пользователь остаётся на той же записи.
- После клика вне ответов цифровые shortcuts прекращают работать; ещё один клик по фону не помогает; клик **по одному из вариантов ответа** восстанавливает управление.
- Не нужна смена/подмена текста, prefetch, навигация по записям или большое число разметок для воспроизведения.
- Самопроизвольное появление другого текста **целиком вне scope**: не диагностировать и не исправлять.
- Подтверждено в Chromium: после click-away фокус переходит с checkbox на `BODY`, `autofocusPosition` становится `null`, путь `keydown` больше не включает контейнер вариантов с локальным обработчиком.

## Заполнить агенту при первом запуске

| Параметр | Значение |
|---|---|
| Путь локального проекта | `H:/argilla/argilla` |
| GitHub URL (без секретов) | https://github.com/FIOWB21/argilla |
| Private/fork/company | Публичный fork; отправлены чистый официальный релиз и документы задачи без корпоративных данных |
| Базовый tag/SHA | `v2.8.0` / `78cb5183f72e59857cf4da3015c42a91c3b46205` — VERIFIED |
| Реальная версия корпоративной сборки | UNKNOWN |
| Рабочая ветка | `fix/annotation-shortcuts-click-away` |
| Коммит комплекта документов | `4f5a9bd47af05e9fb02ec1e5619e3376e5a74e75` — проверен на GitHub; последующие записи журнала см. в `git log -1` |
| VS Code Sync настроен | Upstream tracking настроен; обычный push и сверка SHA через `git ls-remote` в шаге 5 — PASS; кнопка Sync в UI — NOT RUN |
| Регрессионный тест до патча | `ea79513d` — 6 ожидаемых FAIL после click-away, 1 PASS восстановления после клика по ответу |
| Тесты | До патча: Chromium 6 FAIL / 1 PASS. Шаг 3: Chromium 21 PASS; WebKit 20 PASS / 1 SKIP. Шаг 4: общий промежуточный прогон 53 PASS / 1 SKIP; финальная очередь Chromium/WebKit 2 PASS; Jest 510 PASS / 2 прежних SKIP, 54 suites; ESLint PASS |
| Коммиты исправления | Шаг 2: `6fd9d2fa611c5caf3a616233515a4a8097861e39`; шаг 3: `f58ca0c74a48292387e57e5129c44e1784f8b04c`; быстрые клики: `43e8a1ec`; ручной стенд: `e849d0af`; комплект переноса: `e19ddacf6145b9c54261cfad25e9781c25c0d82c` — опубликованы в рабочей ветке, Sync PASS |
| Последний завершённый этап | Шаг 3 — автоматизированная регрессия; Firefox BLOCKED, пользовательская приёмка NOT RUN |

## Чеклист

- [x] Шаг 0 — GitHub, tracking, push и baseline готовы; инструкция Commit → Sync дана, ручной клик по кнопке — NOT RUN
- [x] Шаг 1 — воспроизведение click-away на той же записи
- [x] Шаг 2 — минимальное frontend-исправление
- [x] Шаг 3 — авто-регрессионные тесты в Chromium/WebKit; Firefox-блокер задокументирован
- [ ] Шаг 4 — локальная пользовательская приёмка PASS; полная ручная матрица и корпоративный браузер не подтверждены
- [ ] Шаг 5 — коммиты/комплект/Sync PASS; отправка администратору и решение о PR остаются пользователю
- [ ] Шаг 6 — деплой только с разрешения (опционально)

## История (новые записи добавлять сверху)

### 2026-11-08 — Шаг 5: версия для технического адресата

**Сделано:** по просьбе пользователя [PATCH_HANDOFF.md](./PATCH_HANDOFF.md) сокращён до краткого сообщения человеку, который обслуживает Argilla. Убраны пошаговые инструкции Git/сборки и общие объяснения; оставлены триггер/причина бага, механизм исправления, scope, база, patch, результаты/ограничения проверок и просьба проверить совместимость на staging. Учтено текущее пользовательское редактирование документа; diff STEPS не затрагивается.
**Проверено:** Markdown-ссылки, просмотр diff, `git diff --cached --check` и очевидные шаблоны секретов — PASS. Код и `.patch` не менялись; повторные Jest/E2E/build — NOT RUN. SHA принятого runtime `43e8a1ec`, последняя опубликованная редакция документа до этого изменения — `cdcdc003`.
**Git/далее:** ветка `fix/annotation-shortcuts-click-away`; отдельный docs-коммит (`git log -1`), результат Sync сообщается в ответе. Следующее действие — передача пользователем краткого сообщения и patch техническому адресату; production не менялся.

### 2026-11-08 — Шаг 5: короткая украинская версия для администратора

**Сделано:** по просьбе пользователя [PATCH_HANDOFF.md](./PATCH_HANDOFF.md) переведён на украинский и сокращён. Текст написан простыми словами от первого лица, чтобы его можно было отправить администратору. Оставлены описание проблемы, ссылка на накопленный patch, база `78cb5183`, результаты/границы проверок, применение на тестовом сервере и откат. Подробные таблицы и технические пояснения доступны по ссылкам на журнал и TEST_PLAN.
**Проверено:** локальные Markdown-ссылки, `git diff --cached --check`, просмотр diff и очевидные шаблоны секретов — PASS. SHA256 `.patch` остался `a7f5dd32fca3536412c4d517c5bac527cf69ca42d1c1d7f3cf1f89439e393ea4`. Jest/E2E/build повторно NOT RUN: изменены только документ и эта запись.
**Git:** `fix/annotation-shortcuts-click-away`; предыдущая синхронизированная версия комплекта/журнала — `0438bd9d`, принятый runtime — `43e8a1ec`. Перевод фиксируется отдельным docs-коммитом (`git log -1`); фактический результат Sync сообщается в ответе. Пользовательский diff STEPS не включается.
**Далее:** пользователь передаёт обновлённый документ вместе с прежним patch администратору. Проверка корпоративной сборки и внедрение остаются отдельным этапом.

### 2026-11-08 — Шаг 5: комплект для администратора и Sync

**Статус:** PARTIAL по внешней передаче/согласованию PR; подготовка комплекта и синхронизация DONE. Продолжение после сообщения пользователя «Продолжай» выполнено как подготовка передачи и обычный push в уже согласованную рабочую ветку. Публичный PR, сообщения администратору и deployment не выполнялись.
**Сделано:** [PATCH_HANDOFF.md](./PATCH_HANDOFF.md) содержит проблему/результат, принятую baseline, SHA, четыре изменённых рабочих компонента, результаты/границы тестов, порядок переноса на корпоративную базу, staging и откат к предыдущему образу. [annotation-shortcuts-v2.8.0.patch](./patches/annotation-shortcuts-v2.8.0.patch) — накопленный diff только четырёх рабочих Vue-файлов от `v2.8.0` до `43e8a1ec`; текущий runtime совпадает с ними. [Локальный attributes](./patches/.gitattributes) сохраняет байты `.patch` при Windows checkout; context-маркеры пустых строк unified diff не считаются trailing whitespace. Обновлены [DEPLOYMENT.md](./DEPLOYMENT.md) и устаревший статус [START_HERE.md](../START_HERE.md).
**Проверено:**

- `git diff --binary --output=docs/patches/annotation-shortcuts-v2.8.0.patch v2.8.0 43e8a1ec -- <четыре runtime-пути>` → PASS экспорта. SHA256: `a7f5dd32fca3536412c4d517c5bac527cf69ca42d1c1d7f3cf1f89439e393ea4`.
- В отдельном временном `GIT_INDEX_FILE`: `git read-tree v2.8.0`, `git apply --cached --check ...patch`, `git apply --cached ...patch`, `git diff --cached --exit-code 43e8a1ec -- <четыре runtime-пути>` → **PASS**: patch применим к baseline и воспроизводит принятый рабочий код. Главный index и рабочие исходники не менялись. `git apply --reverse --check docs/patches/annotation-shortcuts-v2.8.0.patch` → **PASS** на текущих исходниках.
- Проверка локальных Markdown-ссылок трёх документов → **PASS**. `git diff --cached --check` после scoped attributes → **PASS**; staged blob `.patch` совпал с `git hash-object --no-filters`, checksum сохранён. Первоначальные предупреждения diff-check относились к пробельным context-маркерам внутри самого `.patch`, не к исходникам.
- Просмотр итогового runtime diff, состава всех исходящих файлов, URL и очевидных шаблонов секретов → **PASS**. Изменены только четыре рабочих компонента, tests/manual fixtures и документация; корпоративных данных/скриншотов/traces в комплекте нет. `git diff --exit-code v2.8.0..HEAD -- argilla-server argilla-frontend/v1 argilla-frontend/package-lock.json` → **PASS**.
- Повторные Jest/E2E и production build → **NOT RUN**: рабочий код не менялся; создавались только документы и экспорт принятого diff. Актуальные выполненные прогоны описаны в предыдущих записях; production-образ не создавался.
- `git fetch origin fix/annotation-shortcuts-click-away` и `git merge-base --is-ancestor origin/fix/annotation-shortcuts-click-away HEAD` → **PASS**; `git push origin HEAD:refs/heads/fix/annotation-shortcuts-click-away` → **PASS**. `git ls-remote --exit-code origin refs/heads/fix/annotation-shortcuts-click-away` подтвердил SHA комплекта **`e19ddacf6145b9c54261cfad25e9781c25c0d82c`**. Baseline на origin осталась `78cb5183`. Force push не использовался. GitHub сообщил canonical URL с именем владельца `FIOWB21`; это тот же согласованный fork, origin не менялся.

**Git:** `fix/annotation-shortcuts-click-away`, комплект `e19ddacf6145b9c54261cfad25e9781c25c0d82c` опубликован и проверен. Эта запись фиксируется отдельным docs-коммитом (`git log -1`) с последующей обычной синхронизацией. Пользовательский diff STEPS остаётся незакоммиченным; Sync не делает commit автоматически. В VS Code коммиты можно проверить через Source Control; дополнительный Sync для уже отправленного комплекта не требуется.
**Риски/следующий шаг:** пользователь передаёт два файла из комплекта администратору. Фактический корпоративный SHA, сборку, backend и целевой браузер проверяет администратор на staging. Шаг 6 — внедрение — отдельно согласуется; публичный PR без согласования не создаётся.

### 2026-11-08 — Шаг 4: подтверждение пользователя

**Результат:** PASS локальной пользовательской приёмки — после выдачи исправленного стенда с 10 синтетическими текстами пользователь сообщил: «всё работает».
**Границы:** число ручных попыток, число фактически проверенных записей и результаты каждого CA-пункта отдельно не сообщены. Не приписывать пользователю 50 кликов или полную матрицу; 50 циклов и десять отправок подтверждены автоматическими тестами вышеописанного прогона. Корпоративный браузер/сборка и настоящий backend остаются NOT RUN / UNKNOWN.
**Сделано/проверено:** обновлён только этот журнал. Повторный Jest/E2E — NOT RUN: исходники и тесты не менялись. `git diff --cached --check`, просмотр diff и проверка очевидных шаблонов секретов перед docs-коммитом — PASS.
**Git:** ветка `fix/annotation-shortcuts-click-away`; принятое исправление `43e8a1ec`, стенд `e849d0af`, предыдущий журнал `d1f8762a`. SHA этой записи — `git log -1`. Push не выполнялся, Sync ожидается; пользовательский diff STEPS сохранён отдельно.
**Далее:** шаг 5 — Sync Changes в VS Code и подготовка передачи патча администратору. Развёртывание в рабочей Argilla не выполнено.

### 2026-11-08 — Шаг 4: быстрые клики, возврат из редактора и 10 текстов

**Статус:** PARTIAL — исходная пользовательская приёмка выявила FAIL при серии кликов; новая пользовательская приёмка ещё не выполнена.
**Наблюдения/причина:** двойной/тройной клик выделяет слово/абзац. Guard непустого Selection ошибочно запрещал возврат фокуса текущему варианту. Два новых Chromium-теста с настоящими `clickCount=2/3` и координатами символа дали **2 ожидаемых FAIL до исправления**, без смены записи. В WebKit фокус checkbox очищает обычное выделение: теперь диапазоны сохраняются и восстанавливаются только при таком очищении. Новых keydown listeners и изменений auto-submit нет.

После редактирования Notes прежний вариант намеренно забывается, чтобы цифры оставались вводом редактора. Проверка явного возврата кликом по ответу нашла отдельную WebKit-проблему: native label activation даёт trusted click на input с `detail=0`, а активным остаётся BODY. Теперь такой реальный клик фокусирует выбранный пользователем checkbox до штатного change; программный `.click()` фокус не перемещает. E2E проверяет ввод `123`, явный возврат к ответу, click-away и `3`. Что именно происходило у пользователя после Notes, пока не уточнено; восстановление после простого выхода из редактора без выбора вопроса не заявляется.

**Сделано:** [QuestionsForm.vue](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.vue) — два уточнения управления фокусом; [unit-тесты](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.spec.js) — сохранение Selection и trusted label click после редактирования; [E2E](../argilla-frontend/e2e/annotation-mode-page/click-away-annotation-mode.spec.ts) — быстрые клики, Notes и 50 циклов на одной записи. [Общий fixture](../argilla-frontend/e2e/annotation-mode-page/click-away.fixture.ts) допускает конфигурацию без Notes. [Ручной fixture](../argilla-frontend/e2e/manual/manual-records.fixture.ts) содержит 10 вымышленных текстов и ответы в памяти; [ручная сессия](../argilla-frontend/e2e/manual/annotation.manual.ts) использует его вместо одной неполной записи. [Smoke-тест очереди](../argilla-frontend/e2e/annotation-mode-page/manual-records.spec.ts) проверяет один вопрос без Notes, соседние записи, ровно десять отправок и чтение ответов через Submitted после reload. Производственные загрузка/переходы/API/backend/сохранение/auto-submit не менялись.

**Проверено (из `argilla-frontend`, Node 20 в PATH):**

- `npm.cmd run e2e:silent -- click-away-annotation-mode.spec.ts --project=chromium --grep 'rapid clicks' --workers=1 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-rapid-glyph-before"` → **2 ожидаемых FAIL до патча**: нужный No не выбран после выделения текста.
- `npm.cmd run e2e:silent -- click-away-annotation-mode.spec.ts manual-records.spec.ts --project=chromium --project=webkit --grep 'editing Notes|50 click-away|manual queue' --workers=2 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-queue-and-focus"` → **6 PASS**, в том числе по 50 click-away циклов и 10 отправленных текстов на браузер.
- `npm.cmd test -- --runInBand` → **510 PASS / 2 прежних SKIP**, 54 suites, 11 snapshots. После уточнения unit-кейса `detail=0`: `npm.cmd test -- --runInBand components/features/annotation/container/questions/QuestionsForm.spec.js` → **43 PASS**.
- `npx.cmd eslint --no-ignore components/features/annotation/container/questions/QuestionsForm.vue components/features/annotation/container/questions/QuestionsForm.spec.js e2e/annotation-mode-page/click-away-annotation-mode.spec.ts e2e/annotation-mode-page/click-away.fixture.ts e2e/manual/annotation.manual.ts e2e/manual/manual-records.fixture.ts e2e/annotation-mode-page/manual-records.spec.ts` → **PASS**. Полный `npm.cmd run lint -- --rule 'prettier/prettier: [error, {endOfLine: auto}]' --format json --output-file "$env:TEMP/argilla-feedback-final-lint.json"` → **0 ошибок / 0 предупреждений**. Override касается прежних CRLF; настройки проекта не менялись.
- `git diff --exit-code -- argilla-frontend/package.json argilla-frontend/package-lock.json` → **PASS**: зависимости и scripts в этом уточнении не менялись.

**Общий browser-прогон:** `npm.cmd run e2e:silent -- click-away-annotation-mode.spec.ts manual-records.spec.ts --project=chromium --project=webkit --workers=2 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-feedback-final-e2e"` → **53 PASS / 1 SKIP** за 5,7 минуты: Chromium 27 PASS, WebKit 26 PASS / 1 прежний numpad SKIP. Предыдущая промежуточная попытка 50 циклов была испорчена изменением тестового файла во время Nuxt-прогона (HMR); общий прогон выполнен без редактирования frontend.

В общем прогоне был поздний синтетический read-запрос `records/search` при закрытии страницы отдельного теста с намеренным 501 на submit; локальный backend отказал в соединении. Попытка дождаться follow-up search и перенос fallback на BrowserContext дали 4 PASS (`argilla-queue-final-isolation`), но warning сохранился. Попытка `networkidle` → FAIL по 30-секундному timeout в Nuxt dev; прогон остановлен Ctrl+C. Эти ожидания удалены. Избыточный тест намеренно неуспешного submit снят: успешный выбор без Notes и ровно одна отправка цифрой покрыты очередью из десяти записей. Fallback BrowserContext оставлен как дополнительный guard; frontend не менялся при этих уточнениях.

**Финальный smoke:** `npm.cmd run e2e:silent -- manual-records.spec.ts --project=chromium --project=webkit --workers=2 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-manual-queue-final"` → **2 PASS**, warning proxy отсутствует. Проверены ровно 10 writes, Next/Previous, Submitted, reload. Финальный targeted ESLint трёх уточнённых TS-файлов → PASS. После удаления избыточного теста в текущем наборе 25 click-away сценариев + один queue smoke на браузер; полный набор повторно NOT RUN — исходное Vue-исправление не менялось с успешного общего прогона, финальное изменение fixture проверено целевым smoke.
**Ручной UI:** `npm.cmd run annotation:manual` → PASS подготовки: видимый Chromium открыт, вход выполнен, первый из десяти текстов виден, Notes отсутствует, выведено `MANUAL READY`. Сессия оставлена работающей без Inspector и лимита времени. Пользовательская повторная приёмка NOT RUN.
**Git:** `fix/annotation-shortcuts-click-away`; исправление — `43e8a1ec`, ручная очередь — `e849d0af`. Перед каждым коммитом просмотрены staged diff, `git diff --cached --check` и очевидные шаблоны секретов — PASS. Push не выполнялся. Пользовательский diff STEPS сохранён отдельно. Для отправки: VS Code → Source Control → Sync Changes.
**Риски/границы:** ответы живут только до перезапуска стенда. Работа реального backend и корпоративная сборка UNKNOWN; различия оформления и отсутствие Notes сами по себе не подтверждают идентичность кода. Firefox-блокер сохраняется.
**Следующий шаг:** пользователь проверяет вручную клики и 10 текстов в открытом окне по обновлённому TEST_PLAN; шаг 4 до этого не отмечать DONE.

### 2026-11-07 — Шаг 4: подготовка удобного ручного стенда

**Статус:** PARTIAL — стенд открыт, результаты ручной проверки ещё не получены.
**Сделано:** по запросу пользователя добавлен `npm.cmd run annotation:manual`. [package.json](../argilla-frontend/package.json) запускает отдельную [конфигурацию](../argilla-frontend/playwright.manual.config.ts) и [ручную сессию](../argilla-frontend/e2e/manual/annotation.manual.ts). Они открывают настоящий frontend в видимом Chromium с существующим синтетическим API, автоматически входят и показывают запись с Yes / No / Not sure. После сообщения `MANUAL READY` автоматизация ждёт закрытия страницы: Inspector отключён, таймера сессии и дальнейших кликов/клавиш нет. Требуемый Notes оставлен пустым. Рабочие компоненты, зависимости и lockfile не менялись. [Инструкция запуска](./TEST_PLAN.md#запуск-стенда-для-ручной-проверки) добавлена в TEST_PLAN.
**Проверено:** `npm.cmd run annotation:manual` → PASS подготовки: окно открыто, вход выполнен, синтетический текст виден, Yes выбран, напечатано `MANUAL READY`; процесс оставлен работающим для пользователя. Это не PASS ручной приёмки. `npx eslint --no-ignore playwright.manual.config.ts e2e/manual/annotation.manual.ts` → PASS, 0 предупреждений на финальном коде. `npm run e2e:silent -- --list` → 462 теста / 9 файлов: ручной `.manual.ts` отсутствует в обычном автопрогоне. `git diff --exit-code -- argilla-frontend/package-lock.json` и `git diff --cached --check` → PASS. Перед коммитом просмотрены staged diff и очевидные шаблоны секретов; пароль в сценарии исключительно синтетический. Полный Jest/E2E повторно NOT RUN: изменён только запуск ручного стенда, результаты шага 3 сохраняются.
**Git:** `fix/annotation-shortcuts-click-away`; код запуска — `238f3d7761972be1b8d81bee3a697e2ab406873c`. Журнал фиксируется отдельным docs-коммитом (`git log -1`). Push не выполнялся; для отправки — VS Code Source Control → Sync Changes. Пользовательский diff STEPS сохранён отдельно.
**Риски/границы:** окно использует замокированный API; backend, сохранение ответов и соседние записи этим стендом не проверяются. Node 20 должен быть доступен в PATH терминала. После закрытия Chromium процесс завершается; запустить заново можно той же командой.
**Следующий шаг:** пользователь проверяет click-away и сообщает браузер, число попыток, потери shortcuts и побочные действия; затем заполнить протокол шага 4. Приёмка пока не отмечена DONE.

### 2026-11-07 — Шаг 3: автоматизированная регрессия и исправление WebKit-фокуса

**Статус:** DONE для автоматизированной регрессии в Chromium/WebKit. Выполнен только шаг 3. Шаг 4, ручные 30–50 кликов, соседние записи и корпоративный браузер — NOT RUN.
**План и результат:** расширить исходные click-away сценарии реальными поиском/меню, клавиатурной навигацией, multi-label/rating, текущим вопросом и mount/unmount; проверить guards диалога и одиночную обработку; запустить существующие scripts проекта. Основные шесть тестов сохраняют доказательство 6 FAIL до → PASS после из шагов 1–2.
**Обнаруженная регрессия:** WebKit 18.2 после восстановления фокуса на фоне мог терять keyboard handler при повторном клике по label другого ответа. Контроль `clicking an answer restores the existing keyboard handler`: на шаге 2 FAIL, на чистом `v2.8.0` в отдельной копии **1 PASS**, после коррекции **PASS** в итоговом наборе. Новый Jest `actually clicked choice` перед коррекцией дал **1 ожидаемый FAIL**: `focus` не вызван. Добавлена минимальная ветка в существующем обработчике click формы: если раньше фокусировался вариант и активен BODY, фокусировать именно реально кликнутый checkbox до штатного change. Есть guards режима focus annotation, доступности действий, saving, record id, disabled, primary click, defaultPrevented и модификаторов. Фокус другого control не захватывается; никаких синтетических click/change/submit не добавлено. Новый глобальный listener не создаётся.
**Изменённые файлы:** [QuestionsForm.vue](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.vue) — 22 строки коррекции; [QuestionsForm.spec.js](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.spec.js) — 13 дополнительных проверок, включая настоящий BaseModal, ARIA overlays, WebKit BODY/guards и 3 mount/destroy с одиночными Enter/auto-submit и удалением того же listener; [E2E](../argilla-frontend/e2e/annotation-mode-page/click-away-annotation-mode.spec.ts) — 21 сценарий; [fixture](../argilla-frontend/e2e/annotation-mode-page/click-away.fixture.ts) — типы вопросов, 15 labels и несколько вопросов с вариантами. Обновлены этот журнал и [TEST_PLAN](./TEST_PLAN.md). Существующий пользовательский diff [STEPS.md](./STEPS.md) с отметками шагов 0–2 не редактировался и не включался в коммиты.
**Проверено (команды из `argilla-frontend`; Node v20.18.1 / npm 10.8.2, временный PATH):**

- `npm run e2e:silent -- click-away-annotation-mode.spec.ts --project=chromium --project=webkit --workers=1 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-step3-final-fixed-e2e"` → **PASS: 41 / SKIP: 1**, без retries, 6.1 минуты. Chromium 21 PASS, WebKit 20 PASS; WebKit numpad SKIP из-за Chromium CDP. Проверены реальные click-away `1/2/3`, текущий вопрос, повторные нажатия, подсказки, modifiers, поиск записей/labels, contenteditable, меню записи, Tab/Shift+Tab/Space, ArrowUp и Escape/ArrowDown, уход со страницы и 3 возврата через SPA history, bulk mode. Счётчики реальных change подтверждают одиночный выбор; response writes отсутствуют. Сам фоновый клик не меняет ответ и viewport scroll.
- `npm test -- --runInBand` → **PASS: 508 тестов / 54 suites / 11 snapshots; 2 прежних SKIP** (BaseCard и SearchLabel). Повторён после WebKit-коррекции; первый полный прогон был 501 PASS. JSDOM geometry в guard-тестах подставлена; реальный фокус подтверждает Playwright.
- `npm test -- --runInBand --runTestsByPath components/features/annotation/container/questions/QuestionsForm.spec.js --testNamePattern 'actually clicked choice'` → **ожидаемый FAIL до коррекции**, 1 тест, 34 отфильтрованы. После коррекции он включён в 508 PASS выше.
- `npx eslint --no-ignore components/features/annotation/container/questions/QuestionsForm.vue components/features/annotation/container/questions/QuestionsForm.spec.js e2e/annotation-mode-page/click-away-annotation-mode.spec.ts e2e/annotation-mode-page/click-away.fixture.ts` → **PASS** на финальных файлах.
- `npm run lint -- --rule 'prettier/prettier: [error, {endOfLine: auto}]' --format json --output-file "$env:TEMP/argilla-step3-final-lint.json"` → **PASS: 0 ошибок / 0 предупреждений**, после коррекции. Обычный lint без override в этом шаге NOT RUN: исходные CRLF описаны ранее, конфигурация не менялась.
- Из отдельной временной копии `git archive v2.8.0` (не Git checkout, исходные Vue неизменны, порт 3001): `npm run e2e:silent -- click-away-annotation-mode.spec.ts --project=webkit --grep 'clicking an answer restores' --workers=1 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-step3-webkit-baseline-ready"` → **1 PASS**. Первые попытки подготовки копии упирались в Windows long paths / междисковый путь CSS и ранний старт теста до сборки; итоговый результат получен после успешной сборки на том же диске.
- Из корня `git diff --exit-code -- argilla-frontend/package.json argilla-frontend/package-lock.json` → **PASS**. Staged diff, `git diff --cached --check`, точный набор четырёх файлов и очевидные шаблоны секретов перед кодовым коммитом → **PASS**. Тестовые traces только с синтетическими данными лежат вне frontend и не добавлялись в Git.

**Firefox / промежуточные E2E:** попытка общего прогона `npm run e2e:silent -- click-away-annotation-mode.spec.ts --workers=1 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-step3-final-e2e"` → Firefox 132 **BLOCKED**: повторяющаяся ошибка страницы 500 `CSS.highlights is undefined` до click-away; прогон остановлен после четырёх одинаковых FAIL. [useSearchTextHighlight.ts](../argilla-frontend/components/features/annotation/container/fields/useSearchTextHighlight.ts) идентичен `v2.8.0` (сверено `git diff --exit-code v2.8.0 -- argilla-frontend/components/features/annotation/container/fields/useSearchTextHighlight.ts` → PASS). Поддержка этого API не менялась. Промежуточные ошибки новых тестов исправлены: строгий selector меню, штатное сохранение стрелок в редакторе до Escape, реальные Tab-preconditions для WebKit multi-label и таймаут 60 секунд для трёх SPA-циклов. Неудачный контроль WebKit не скрыт skip-ом: регрессия исправлена и контроль зелёный.
**Ручной UI / границы:** пользовательская приёмка NOT RUN. В focus UI нет доступной модалки/native textarea/select/combobox; диалог проверен настоящим BaseModal в Vue Test Utils, guards остальных элементов — Jest. Browser-проверка модалки и этих controls не объявляется пройденной. В WebKit для дополнительных multi-label сценариев checkbox при необходимости достигается настоящим Tab; основной click-away и контроль повторного клика по ответу идут без этой подготовки.
**Git:** `fix/annotation-shortcuts-click-away`; код и тесты — **`f58ca0c74a48292387e57e5129c44e1784f8b04c`**. Baseline `78cb5183` сохранён. Журнал и матрица фиксируются отдельным docs-коммитом, его SHA — `git log -1`. Push в шаге 3 не выполнялся; Sync ожидается. VS Code: `Ctrl+Shift+G` → проверить ветку/коммиты → **Sync Changes**; повторный Commit уже сохранённых изменений не нужен. Пользовательский diff STEPS остаётся незакоммиченным.
**Риски/неизвестное:** корпоративная сборка UNKNOWN; Firefox 132 BLOCKED. Удаление [временной baseline-копии](../../a3baseline-step3/) заблокировано автоматической политикой (`blocked by policy`, подробная причина не предоставлена); каталог оставлен вне Git, его сервер остановлен. Никакого production deploy или публичного PR не было.
**Следующий шаг:** шаг 4 — ручная проверка и приёмка по TEST_PLAN, включая 30–50 кликов на разрешённых синтетических данных. Автоматически не начинать.

### 2026-11-07 — Шаг 2: безопасное восстановление фокуса после click-away

**Статус:** DONE. Выполнен только шаг 2; полная матрица регрессии и ручная приёмка остаются шагами 3–4.
**Решение:** использован существующий `v-click-outside` и обработчик клика формы. Новый глобальный `keydown` не добавлялся. Форма запоминает последний реально сфокусированный checkbox single-label/multi-label/rating; безопасный клик возвращает ему фокус через `focus({ preventScroll: true })`. Поэтому последующая цифра проходит по прежнему локальному обработчику и соответствию shortcuts. Само восстановление фокуса не создаёт `click/change/submit`.
**Границы и защиты:** маркер режима focus annotation на контейнере; проверяются наличие/видимость варианта, доступность действий, состояние сохранения, интерактивные предки target, модификаторы мыши, сохранённое выделение текста, другой активный control, открытые class-based/ARIA overlays, `inert` и `aria-hidden`. Фокус внутри редактора очищает запомненный вариант. Фоновый клик не выбирает произвольный первый вопрос. Guards модификаторов/IME дополнены в существующих label/rating/document обработчиках; в rating `preventDefault` применяется только к обрабатываемой цифре/Space. Бизнес-логика auto-submit и сохранения не менялась.
**Изменённые файлы:** [FocusAnnotation](../argilla-frontend/components/features/annotation/container/mode/FocusAnnotation.vue) — граница режима; [QuestionsForm](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.vue) — запоминание/восстановление фокуса и guards; [LabelSelection](../argilla-frontend/components/features/annotation/container/questions/form/shared-components/label-selection/LabelSelection.component.vue) и [RatingShortcuts](../argilla-frontend/components/features/annotation/container/questions/form/rating/RatingShortcuts.vue) — модификаторы; [Jest](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.spec.js) — 28 проверок восстановления/отказа; [E2E](../argilla-frontend/e2e/annotation-mode-page/click-away-annotation-mode.spec.ts) — дополнительные проверки фонового клика, редактора, модификаторов и numpad. Обновлён [TEST_PLAN](./TEST_PLAN.md).
**Проверено (команды из `argilla-frontend`, Node v20.18.1 / npm 10.8.2 из ранее подготовленной временной папки):**

- До изменения исходников: `npm run e2e:silent -- click-away-annotation-mode.spec.ts --project=chromium --workers=1 --retries=0 --reporter=line` → ожидаемый FAIL: те же 6 отказов после click-away, контрольный тест PASS.
- Итоговый прогон: `npm run e2e:silent -- click-away-annotation-mode.spec.ts --project=chromium --workers=1 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-focus-step2-results"` → PASS: **11/11**, без retries. Первые шесть сценариев теперь зелёные на той же синтетической записи. Проверено отсутствие изменений ответа от самого фонового клика, response writes, смены URL/текста; повторные клики по тексту/фону/заголовку вопроса, отсутствие прокрутки viewport, ввод `123` в реальный contenteditable, Ctrl/Alt/Meta/Shift и цифровой блок.
- `npm test -- --runInBand --runTestsByPath components/features/annotation/container/questions/QuestionsForm.spec.js components/features/annotation/container/questions/form/shared-components/label-selection/labelSelection.component.spec.js components/features/annotation/container/questions/form/rating/ratingMonoSelection.component.spec.js` → PASS: **45 тестов / 3 suites** (28 новых + 17 существующих). JSDOM проверяет guards с подставленной геометрией; реальная потеря/возврат фокуса подтверждена E2E.
- `npx eslint --no-ignore components/features/annotation/container/mode/FocusAnnotation.vue components/features/annotation/container/questions/QuestionsForm.vue components/features/annotation/container/questions/QuestionsForm.spec.js components/features/annotation/container/questions/form/shared-components/label-selection/LabelSelection.component.vue components/features/annotation/container/questions/form/rating/RatingShortcuts.vue e2e/annotation-mode-page/click-away-annotation-mode.spec.ts` → PASS на финальных файлах.
- `npm run lint -- --rule 'prettier/prettier: [error, {endOfLine: auto}]' --format json --output-file "$env:TEMP/argilla-focus-step2-lint.json"` → PASS: **0 ошибок / 0 предупреждений**. Запущен до последних добавлений guards, после них повторён targeted ESLint выше. Обычный lint без endOfLine override в этой сессии NOT RUN: исходная проблема CRLF зафиксирована на шаге 1; конфигурация проекта не менялась.
- Из корня: `git diff --exit-code -- argilla-frontend/package.json argilla-frontend/package-lock.json` → PASS; зависимости не менялись. `git diff --cached`, `git diff --cached --check` и проверка diff на очевидные секреты → PASS перед коммитом.

**Промежуточные сбои тестового стенда:** неверные новые селекторы заголовка/редактора исправлены по фактическим компонентам; ошибка attachTo в unit-стенде исправлена отдельной точкой монтирования. Nuxt watcher завершался с `EPERM` при чтении ZIP trace в папке frontend; финальный прогон пишет результаты вне проекта. Playwright 1.49 `keyboard.press("Numpad2")` отправляет `ArrowDown` (NumLock off); тест цифрового режима передаёт настоящий browser key event `key=2, code=Numpad2` через Chromium CDP. Это ограничение тестового API, перехват стрелок ради numpad не добавлялся.
**Ручной UI:** NOT RUN. Проверены реальные автоматизированные клики Chromium; отдельная пользовательская приёмка, 30–50 повторений, браузер компании, Firefox/WebKit, весь набор Enter/Tab/стрелок, lifecycle и browser E2E для меню/модалок/multi-label/rating остаются NOT RUN. Меню/модалки/поля ввода и скрытые состояния покрыты unit-проверками guards восстановления фокуса.
**Git:** ветка `fix/annotation-shortcuts-click-away`; commit патча **`6fd9d2fa611c5caf3a616233515a4a8097861e39`**. Baseline `78cb5183` сохранён. Журнал фиксируется отдельным docs-коммитом, его SHA — `git log -1`. Push в этой сессии не выполнялся; Sync ожидается. В VS Code: `Ctrl+Shift+G` → проверить ветку и diff/коммиты → **Sync Changes**. Код уже закоммичен; повторный Commit не нужен.
**Риски/неизвестное:** корпоративная сборка по-прежнему UNKNOWN. Селекторы overlays сверены с текущими BaseModal/BaseDropdown; полная браузерная проверка этих состояний остаётся шагом 3. Намеренное выделение текста сохраняется и не вызывает восстановление фокуса. Механизм включён только в focus annotation; bulk-режим не расширялся.
**Следующий шаг:** шаг 3 — расширенная автоматизированная регрессия по TEST_PLAN: реальные поиск/меню/диалог, навигация клавиатурой, multi-label/rating, смена/размонтирование страницы без повторных обработчиков. Не начинать шаг 4 или deploy автоматически.

### 2026-11-07 — Шаг 1: click-away воспроизведён, причина подтверждена

**Статус:** DONE для диагностики. Исправление ещё не внесено, регрессионные тесты намеренно красные.
**План и результат:** исследованы реальные компоненты и global listeners, поднят локальный frontend, подготовлена синтетическая запись и воспроизведение настоящими кликами Playwright. Создан тестовый коммит `ea79513d` (`test: reproduce shortcut loss after background click`).
**Причина:** [LabelSelection](../argilla-frontend/components/features/annotation/container/questions/form/shared-components/label-selection/LabelSelection.component.vue) слушает `keydown` только на своём контейнере. [QuestionsForm](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.vue) через `v-click-outside` обнуляет `autofocusPosition` и ставит `userComesFromOutside = true`; существующий document listener обрабатывает Tab/Enter/Backspace/сохранение, но не выбор цифрового варианта. Повторный фоновый клик не проходит через обработчик клика самой формы. Watcher `isFocused` в LabelSelection возвращает фокус только при изменении пропа на true. Клик по варианту штатно восстанавливает фокус.
**Браузерные данные:** до click-away `activeElement = INPUT#decision_yes`, индекс вопроса `1`, `userComesFromOutside = false`; путь клавиши включает `DIV.container` и `FORM.questions-form`. После клика по тексту или фону: `focusout: INPUT#decision_yes`, `activeElement = BODY`, индекс `null`, `userComesFromOutside = true`, путь `BODY → HTML → HTMLDocument → Window`. Это подтверждено во всех 6 вариантах. Доступ к Vue instance используется только для чтения диагностического состояния, фокус искусственно не подменяется.
**Изменённые файлы:** [E2E](../argilla-frontend/e2e/annotation-mode-page/click-away-annotation-mode.spec.ts), [синтетические API-заглушки](../argilla-frontend/e2e/annotation-mode-page/click-away.fixture.ts), журнал и результаты в [TEST_PLAN](./TEST_PLAN.md). Производственные Vue-компоненты и backend не редактировались.
**Безопасность теста:** loopback URL проверяется перед открытием страницы, все API перехвачены, немокированные запросы заблокированы. На странице ровно одна синтетическая запись и один single-label вопрос с тремя вариантами; дополнительный обязательный текстовый вопрос оставлен пустым, чтобы штатный auto-submit не переключал запись. Проверены неизменность URL/текста, отсутствие response writes и немокированных API до проверки выбранного варианта.
**Тесты (рабочая папка `argilla-frontend`):**

- `npm run e2e:silent -- click-away-annotation-mode.spec.ts --project=chromium --workers=1 --retries=0 --reporter=line --trace=on` → ожидаемый FAIL: 6 проверок цифр после клика по тексту/фону; контроль восстановления по ответу → PASS. Каждый из 6 тестов сначала проверяет успешный выбор клавишей до click-away. Ошибка именно `Expected: checked / Received: unchecked`, не вход/настройка стенда. Последний полный прогон — 6 FAIL / 1 PASS.
- `npm test -- --runInBand --runTestsByPath components/features/annotation/container/questions/form/shared-components/label-selection/labelSelection.component.spec.js components/features/annotation/container/questions/form/rating/ratingMonoSelection.component.spec.js` → PASS: 17 тестов, 2 suites.
- `npx eslint --no-ignore e2e/annotation-mode-page/click-away.fixture.ts e2e/annotation-mode-page/click-away-annotation-mode.spec.ts` → PASS. `--no-ignore` необходим, потому что штатный линтер исключает e2e.
- `npx prettier --check e2e/annotation-mode-page/click-away.fixture.ts e2e/annotation-mode-page/click-away-annotation-mode.spec.ts` → PASS перед финальным дополнением диагностики; после дополнения выполнен Prettier и повторный ESLint → PASS.
- `npm run lint` → FAIL: 54 001 ошибка исходных CRLF в Windows checkout. Повтор с `npm run lint -- --rule 'prettier/prettier: [error, {endOfLine: auto}]' --format json --output-file <временный отчёт>` → PASS, exit 0. Исходные файлы и конфигурация линтера не переформатировались.
- `git diff --exit-code -- argilla-frontend/package.json argilla-frontend/package-lock.json` из корня → PASS: зависимости проекта не менялись.

**Окружение:** Node v20.18.1 / npm 10.8.2 перенесены в `$env:TEMP/argilla-focus-tools/node-v20.18.1-win-x64`, ZIP проверен по официальному SHA256; системный PATH не менялся. Перед командами временно добавлять эту папку в PATH текущего терминала либо использовать свой Node 20. Chromium Playwright 1148 установлен через `npx playwright install chromium`. `npm ci` без legacy-флага не принимает исходный lockfile (`buffer`); установка без lockfile привела к несовместимому Webpack 5. Рабочее окружение получено через `npm ci --legacy-peer-deps --no-audit --no-fund`, фактический Webpack 4.47.0; frontend собран `npm run dev` и проверен тестами. Исходные старые E2E helpers содержат устаревшие login selectors и ответы API; новый сценарий их обходит, не изменяя существующие тесты.
**Ручной UI:** отдельная пользовательская приёмка NOT RUN; клики выполнены автоматизированно в настоящем Chromium. Firefox/WebKit, поля ввода, меню, модалки и 30–50 повторений — этапы 3–4, NOT RUN. Trace содержит только синтетические данные и хранится локально в игнорируемых результатах тестов; в Git не включается.
**Git:** `fix/annotation-shortcuts-click-away`, тестовый commit `ea79513d`; baseline `78cb5183` сохранён. Итоговый SHA журнала смотреть в `git log -1`.
**Риски:** E2E сейчас намеренно FAIL до патча. Корпоративная сборка по-прежнему неизвестна. Не выбирать произвольный первый вопрос после click-away: воспроизведение использует второй вопрос.
**Следующий шаг:** этап 2 — минимальный механизм для текущего вопроса с защитой ввода, меню/модалок и одиночной обработкой; повторить те же 6 тестов до зелёного результата. Бизнес-логику auto-submit и сохранения не менять.

### 2026-11-07 — Шаг 0: docs-коммит и синхронизация

**Статус:** PARTIAL — техническая часть готова; ручная проверка кнопки Sync в VS Code — NOT RUN.
**Сделано:** создан `4f5a9bd47af05e9fb02ec1e5619e3376e5a74e75` (`docs: add annotation shortcut task and progress tracking`), содержащий 8 документов задачи. Коммит отправлен в рабочую ветку GitHub. Эта запись фиксирует его SHA отдельным коммитом журнала.
**Проверено:** `git diff --cached --stat`, `git diff --cached`, `git diff --cached --check` — PASS; staged-набор совпал с 8 ожидаемыми документами, проверка на очевидные шаблоны секретов — PASS. `git commit` — PASS. `git push origin fix/annotation-shortcuts-click-away` — PASS. `git ls-remote origin refs/heads/fix/annotation-shortcuts-click-away` — PASS: удалённый SHA совпал с локальным `4f5a9bd47af05e9fb02ec1e5619e3376e5a74e75`. После отправки рабочее дерево было чистым, ahead/behind отсутствовал.
**Тесты и линтер приложения:** NOT RUN — изменена только документация. Сценарий click-away ещё не воспроизводился.
**Git:** автор задан только в локальной конфигурации проекта; baseline остаётся на `78cb5183`, рабочая ветка — `fix/annotation-shortcuts-click-away`. Существующая история сохранена.
**Инструкция пользователю:** в VS Code открыть Source Control (`Ctrl+Shift+G`), проверить рабочую ветку. При будущих изменениях просмотреть diff, нажать `+`, затем Commit и Sync Changes. Сейчас коммит уже отправлен, поэтому новых исходящих коммитов быть не должно; ручной клик по Sync не заявляется как выполненная проверка.
**Риски/неизвестное:** реальная корпоративная сборка неизвестна; fork публичный, корпоративные данные не добавлялись.
**Следующий шаг:** пользовательская проверка состояния Source Control; затем этап 1 — диагностика фокуса и воспроизведение click-away на синтетической записи без смены записи.

### 2026-11-07 — Шаг 0: настройка автора и подготовка docs-коммита

**Статус:** PARTIAL
**Сделано:** по ответу пользователя настроены `user.name` и `user.email` через `git config --local`; глобальная конфигурация не менялась. Имя автора — Vitaliy. Для первого коммита подготовлены только 8 документов задачи.
**Проверено:** `git config --local --get user.name`, `git config --local --get user.email` — PASS. Проверены ветки, статус, remotes и последние 20 коммитов; выбран существующий в истории формат `docs: ...`.
**Тесты приложения:** NOT RUN — изменения касаются документации и настройки Git.
**Git:** `fix/annotation-shortcuts-click-away`, исходный HEAD `78cb5183`; tracking уже настроен.
**Следующий шаг:** проверить staged diff и секреты, создать docs-коммит, отправить его и записать фактический SHA и статус синхронизации.

### 2026-11-07 — Шаг 0: проверка Git и сохранение baseline

**Статус:** PARTIAL
**План:** проверить исходное состояние, сохранить официальный релиз и отдельную рабочую ветку, перенести документы, затем настроить автора и создать docs-коммит.
**Наблюдения:** исходное дерево чистое, ветка `develop` на `5338519accb13ae422f8bf9c0642651c249c49af`, origin уже подключён к пользовательскому публичному fork. Теги отсутствовали. Официальный тег `v2.8.0` подтверждён через `git ls-remote`, загружен с официального upstream. Ветка `develop` сохранена без изменений. Локальные `user.name` / `user.email` и эффективные значения Git не настроены; пользователь получил отдельный запрос.
**Изменённые файлы:** перенесены 8 документов из соседней папки пакета; перед копированием проверено отсутствие совпадающих файлов, после — совпадение SHA256. Обновлён этот журнал. Исходники приложения не редактировались.
**Проверки:** `git status --short --branch`, `git branch -vv`, `git log -5 --oneline`, `git remote -v` — PASS. `git rev-parse 'v2.8.0^{commit}'` — PASS, SHA совпадает с официальным релизом. `git push --atomic --set-upstream origin baseline/argilla-v2.8.0 fix/annotation-shortcuts-click-away` — PASS; обе ветки созданы на GitHub, tracking настроен. Тесты приложения — NOT RUN, этап подготовки Git.
**Ручной UI:** VS Code Sync и сценарий click-away ещё не проверялись.
**Git:** baseline и рабочая ветка на `78cb5183`; документы пока не закоммичены. Существующий origin не менялся.
**Риски:** fork публичный; корпоративные изменения и данные в него не добавлять. Фактическая корпоративная сборка неизвестна. Автор коммитов требует настройки по ответу пользователя.
**Следующий шаг:** завершить этап 0 — настроить имя/email только для этого репозитория, проверить diff документов, создать docs-коммит и отправить его; объяснить Commit → Sync Changes. Затем этап 1.

### 2026-11-07 — пересмотр задачи, документация (ChatGPT)

**Сделано:** переопределён триггер с «смены записи» на **«клик мышью вне вариантов ответа»**; обновлены .md и чеклисты, сохранена приоритетная настройка GitHub.
**Код Argilla:** без изменений. **Тесты:** NOT RUN. **Git:** NOT CONFIGURED в рамках этого пакета.
**Следующий шаг:** Шаг 0. **Commit:** NONE.

---

## Шаблон отчёта агента

```markdown
### YYYY-MM-DD — Шаг N: заголовок
**Статус:** DONE / PARTIAL / BLOCKED
**План:** ...
**Наблюдения/причина:** ...
**Изменённые файлы:** ...
**Тесты:** точная команда → PASS/FAIL/NOT RUN и причина
**Ручной UI:** где щёлкнули, сработала ли цифра на той же записи, число попыток
**Git:** branch ..., SHA ..., origin ..., Sync YES/NO
**Риски:** ...
**Следующий шаг:** ...
```

Не отмечай DONE без проверки. Не записывай в этот журнал рабочие тексты и закрытые данные.
