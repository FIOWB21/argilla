# PROGRESS.md — журнал выполнения и продолжения между чатами

**Проект:** Argilla v2.8.0 — shortcuts `1/2/3` после клика мышью вне вариантов ответа **на той же записи**.
**Дата актуализации задания:** 2026-11-07.
**Статус:** Шаг 3 DONE — расширенная регрессия: Chromium/WebKit 41 PASS / 1 SKIP, полный Jest 508 PASS / 2 прежних SKIP, линтер PASS. Найденная WebKit-регрессия шага 2 исправлена и проверена. Firefox 132 BLOCKED из-за исходного CSS.highlights; корпоративная установка не менялась.
**Текущий этап:** Шаг 4 — ручная проверка и приёмка; НЕ НАЧАТ.

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
| VS Code Sync настроен | Upstream tracking настроен, push документов и проверка удалённого SHA — PASS; кнопка Sync в UI — NOT RUN |
| Регрессионный тест до патча | `ea79513d` — 6 ожидаемых FAIL после click-away, 1 PASS восстановления после клика по ответу |
| Тесты | До патча: Chromium 6 FAIL / 1 PASS. Итог шага 3: Chromium 21 PASS; WebKit 20 PASS / 1 SKIP; Jest 508 PASS / 2 прежних SKIP, 54 suites; ESLint PASS |
| Коммиты исправления | Шаг 2: `6fd9d2fa611c5caf3a616233515a4a8097861e39`; шаг 3 (WebKit и тесты): `f58ca0c74a48292387e57e5129c44e1784f8b04c` — локальный, Sync ожидается |
| Последний завершённый этап | Шаг 3 — автоматизированная регрессия; Firefox BLOCKED, пользовательская приёмка NOT RUN |

## Чеклист

- [x] Шаг 0 — GitHub, tracking, push и baseline готовы; инструкция Commit → Sync дана, ручной клик по кнопке — NOT RUN
- [x] Шаг 1 — воспроизведение click-away на той же записи
- [x] Шаг 2 — минимальное frontend-исправление
- [x] Шаг 3 — авто-регрессионные тесты в Chromium/WebKit; Firefox-блокер задокументирован
- [ ] Шаг 4 — ручные проверки кликов и регрессий
- [ ] Шаг 5 — коммиты, GitHub, PR/передача
- [ ] Шаг 6 — деплой только с разрешения (опционально)

## История (новые записи добавлять сверху)

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
