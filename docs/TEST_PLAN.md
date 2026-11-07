# TEST_PLAN.md — испытания: клик вне варианта ответа и работа горячих клавиш

## Базовый принцип

**Тестировать именно click-away без смены записи.** Создать синтетическую запись с одним single-label вопросом на три ответа. До патча зафиксировать отказ цифрового shortcut после клика по фону; после патча — успешный выбор без повторного клика по ответу. Не использовать реальные рабочие тексты, не запускать массовую разметку компании.

Реальные команды и тестовое окружение брать из `argilla-frontend/package.json`, lockfile и документации проекта. Наличие Jest/Playwright сначала подтвердить. Записывать настоящие результаты, а не запланированные.

## Ключевой сценарий — обязателен и приоритетен

1. Открыть **одну** тестовую запись A с Yes / No / Not sure и кнопками `1`, `2`, `3`.
2. Установить фокус в области варианта ответа, проверить, что `1/2/3` работают (сбросить тестовое состояние между попытками, чтобы не спутать выбранный ответ с реакцией).
3. Щёлкнуть мышью по **пустому фону страницы** вне вариантов. Не менять запись и не открывать модалку.
4. Нажать цифру `2`. **Должен выбраться второй вариант** текущего вопроса. Клик по ответу между шагами 3 и 4 запрещён.
5. Повторить с кликом по обычному тексту записи (если текст не является `contenteditable` или другой областью ввода).
6. Проверить, что простой клик по фону не создаёт ответа/submit, выбор цифрой обрабатывается только один раз.
7. Вернуть фокус кликом по варианту ответа; убедиться, что существующее поведение Enter/Tab сохранилось.

**До фикса:** ожидается воспроизводимый провал на шагах 3–4, не на переходе к новой записи. **После фикса:** PASS.

## Таблица проверок

| ID | Действие | Ожидается | Статус |
|---|---|---|---|
| CA-01 | На той же записи: вариант → клик по пустой области → `1` | Первый ответ выбирается | FAIL до патча → PASS после, Chromium 2026-11-07 |
| CA-02 | На той же записи: вариант → клик по обычному тексту → `2` | Второй ответ выбирается | FAIL до патча → PASS после, Chromium 2026-11-07 |
| CA-03 | Клик по фону несколько раз → `3`; двойной/тройной клик по тексту → цифра | Нужный ответ выбирается, выделение текста сохраняется | PASS Chromium/WebKit: реальные clickCount=2/3; ручная повторная проверка ожидается |
| CA-04 | 30–50 чередований «клик в фон → цифра» | Ни одной потери shortcuts | PASS Chromium/WebKit: 50 циклов на той же записи, чередование фона/текста и `1/2/3`; пользовательская приёмка ожидается |
| CA-05 | Клик на самом ответе, затем `Enter` / Tab / стрелки | Существующее поведение сохранено | PASS Chromium: Tab/Shift+Tab, Space, ArrowUp, Escape/ArrowDown; Enter не отправляет неполную запись; Jest проверяет Enter на полной форме |
| CA-06 | Ввод цифр в `input`, `textarea`, `contenteditable`, поиск | Цифры вводятся, **не** выбирают ответы | PASS Chromium: contenteditable, поиск записей и поиск labels; textarea/select guards Jest PASS; отдельного native textarea/select в focus UI нет |
| CA-07 | Открытая модалка, выпадающее меню, combobox | Клавиши обслуживают активный UI, не форму разметки | PARTIAL: реальное меню Chromium PASS, настоящий BaseModal и ARIA overlays Jest PASS; модалка/combobox browser E2E NOT RUN — в данном focus UI нет доступного сценария открытия |
| CA-08 | Ctrl/Alt/Meta + цифра, браузерные сочетания | Не перехватываются | PASS Chromium: Ctrl/Alt/Meta/Shift + `2` в single-label/multi-label/rating; глобальные modifiers/IME Jest PASS; прочие сочетания NOT RUN |
| CA-09 | Клик по другой интерактивной кнопке/ссылке | Фокус не захватывается насильно, побочных выборов нет | PASS Chromium: меню и поиск не возвращают фокус вариантам; guards ссылок и остальных controls Jest PASS; browser-клик по ссылке отдельно NOT RUN |
| CA-10 | Другая страница Argilla / скрытая форма | Нет активного обработчика разметки | PASS Chromium: уход на список datasets и bulk mode; hidden/inert/aria-hidden и отсутствие режима Jest PASS |
| CA-11 | Несколько вопросов в одной записи | Правильный текущий вопрос и нумерация shortcuts | PASS Chromium: Notes + Tags multi-label + Decision; переключение текущего вопроса мышью и click-away меняют только его ответ |
| CA-12 | Multi-label/rating (если поддерживается в пути изменения) | Поведение и доступность не ухудшились | PASS Chromium: выбор/повторный toggle цифрой после click-away, modifiers, ровно 3 change на 3 цифры; компонентные Jest PASS |
| CA-13 | Повторные mount/unmount страницы разметки | Нет двойных listeners, двойных выборов | PASS: Chromium — 3 SPA-цикла назад/вперёд без reload и ровно один change; Jest — 3 mount/destroy, удаление того же document listener и отсутствие повторных submit |
| CA-14 | Нажать цифру ровно один раз после клика | Не происходит двойного submit/навигации | PASS Chromium: подсчёт реальных change для single-label/multi-label/rating; response writes отсутствуют; Enter/auto-submit events ровно по одному в Jest |
| CA-15 | Стандартный переход к соседней записи, назад/вперёд | Нет новых регрессий после фикса | PASS Chromium/WebKit: очередь из 10 текстов, Next/Previous, отправка цифрами, Submitted и reload; API в памяти, реальный backend NOT RUN |
| CA-16 | Клик по фону не вызывает scroll/focus jump и сам ничего не выбирает | Нет неожиданных side effects | PARTIAL: ответ не меняется, viewport scroll неизменён; focus preventScroll Jest PASS; nested scroll NOT RUN |

## Автоматизированные тесты

### Уточнение по ручной проверке — 2026-11-08, шаг 4

Реальные двойные/тройные клики по символу выделяют слово/абзац. Старый guard Selection мешал вернуть фокус вариантам: новые тесты дали **2 FAIL до уточнения патча**, затем PASS. Фокус теперь восстанавливается с сохранением выделенных диапазонов, включая WebKit. Отдельно проверены возврат к ответам после ввода Notes и **50 чередований клика и цифры на одной записи** в Chromium/WebKit.

```powershell
npm.cmd run e2e:silent -- click-away-annotation-mode.spec.ts manual-records.spec.ts --project=chromium --project=webkit --workers=2 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-feedback-final-e2e"
```

Результат общего промежуточного прогона: **53 PASS / 1 прежний numpad SKIP**, без retries: Chromium 27 PASS, WebKit 26 PASS / 1 SKIP. Затем удалён избыточный сценарий намеренно неуспешного submit: его поздний read при закрытии давал warning локального proxy, а успешная отправка без Notes уже покрыта очередью. В финальном наборе 25 сценариев click-away и один queue smoke на браузер. Smoke проверяет десять реальных UI-отправок в синтетический API в памяти, ровно один write на цифру, переход Next/Previous, Submitted и чтение выбранного ответа после reload. Финальный запуск `npm.cmd run e2e:silent -- manual-records.spec.ts --project=chromium --project=webkit --workers=2 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-manual-queue-final"` → **2 PASS**, без proxy warning. Полный набор после удаления дублирования повторно NOT RUN; само Vue-исправление не менялось. Реальный backend не проверялся. Промежуточные проверки и неудачная попытка `networkidle` записаны в PROGRESS.

Полный `npm.cmd test -- --runInBand` → **510 PASS / 2 прежних SKIP**, 54 suites, 11 snapshots. Финальная целевая QuestionsForm suite → **43 PASS**, включая trusted label click с `detail=0` после редактора. Targeted ESLint всех семи изменённых Vue/JS/TS файлов и полный линтер с прежним override CRLF → **PASS**. Firefox остаётся BLOCKED по описанной ниже исходной несовместимости. Пользовательская повторная приёмка нового стенда ожидается.

### Расширенная регрессия — 2026-11-07, шаг 3

Коммит кода и тестов: `f58ca0c74a48292387e57e5129c44e1784f8b04c`. Финальный прогон → **41 PASS / 1 SKIP**, без retries: Chromium **21 PASS**, WebKit **20 PASS / 1 SKIP** (numpad использует только Chromium CDP).

```powershell
npm run e2e:silent -- click-away-annotation-mode.spec.ts --project=chromium --project=webkit --workers=1 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-step3-final-fixed-e2e"
```

Все перечисленные в таблице Chromium browser PASS также подтверждены в WebKit тем же набором, кроме numpad. Финальные прогоны не обнаружили критичных регрессий. Firefox и ручные проверки имеют ограничения ниже.

В [click-away-annotation-mode.spec.ts](../argilla-frontend/e2e/annotation-mode-page/click-away-annotation-mode.spec.ts) теперь 21 сценарий. Синтетический [fixture](../argilla-frontend/e2e/annotation-mode-page/click-away.fixture.ts) поддерживает single-label, multi-label, rating, поиск среди 15 labels и несколько вопросов с вариантами. Проверяются реальные клавиши/клики без искусственного назначения фокуса: поиск записей/labels, открытое меню записи, Tab/Shift+Tab/Space, стрелки и Escape из редактора, modifiers, повторный toggle, подсказки цифр, текущий вопрос, bulk mode, 3 SPA-цикла назад/вперёд. Счётчик реальных `change` исключает двойной выбор; API по-прежнему полностью замокирован, записи ответов не допускаются.

В [QuestionsForm.spec.js](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.spec.js) добавлены 13 тестов: настоящий BaseModal, ARIA dialog/menu/listbox (видимые и скрытые), disabled choice, фокус реально кликнутого checkbox при BODY, guards modifiers/другого активного control и 3 mount/destroy формы с проверкой регистрации/удаления того же document listener, modifiers/IME и одиночных Enter/auto-submit событий. Геометрия в JSDOM подставлена; браузерный фокус этой проверкой не имитируется.

Итоговый `npm test -- --runInBand` → **PASS: 508 тестов, 54 suites, 11 snapshots; 2 существующих skip** (BaseCard и SearchLabel). До WebKit-коррекции было 501 PASS; три целевых suites на том состоянии → 51 PASS. Targeted ESLint четырёх финальных Vue/тестовых файлов с `--no-ignore` → PASS. Полный `npm run lint -- --rule 'prettier/prettier: [error, {endOfLine: auto}]' --format json --output-file "$env:TEMP/argilla-step3-final-lint.json"` → **0 ошибок / 0 предупреждений**. Обычный lint без override в шаге 3 NOT RUN: исходные Windows CRLF описаны ранее, конфигурация не менялась.

Firefox 132 / Playwright 1466: **BLOCKED** до click-away. Страница уходит в 500 `CSS.highlights is undefined` при начальной проверке работы клавиши. [useSearchTextHighlight.ts](../argilla-frontend/components/features/annotation/container/fields/useSearchTextHighlight.ts) обращается к API без проверки и идентичен `v2.8.0` (`git diff --exit-code v2.8.0 -- argilla-frontend/components/features/annotation/container/fields/useSearchTextHighlight.ts` → PASS). Общий прогон трёх браузеров остановлен после повторения этой ошибки; Firefox не объявляется зелёным и не скрывается через новый skip/polyfill.

WebKit выявил регрессию шага 2: после click-away повторный клик по label другого ответа оставлял фокус на BODY. Тот же контроль `clicking an answer restores the existing keyboard handler` на чистом `v2.8.0` в отдельной временной копии → **1 PASS**, на шаге 2 → **FAIL**. Добавленный Jest `actually clicked choice` → **1 ожидаемый FAIL** до коррекции (focus не вызван). В [QuestionsForm.vue](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.vue) добавлен только возврат фокуса реально кликнутому checkbox, если ранее фокусировался вариант, активен BODY и выполняются guards режима/состояния/модификаторов. Это происходит до штатного change и не создаёт click/change/submit. Клики, вызванные клавиатурой при фокусе на control, не перемещают фокус. Для multi-label в WebKit тест предварительно достигает checkbox настоящим Tab: это проверяет потерю уже работающего фокуса, не маскируя отсутствие native focus на label. Навигационный тест имеет лимит 60 секунд для 3 SPA-циклов.

Доказательство красного baseline основного бага сохранено в тестовом коммите `ea79513d` и результатах шагов 1–2: те же шесть основных сценариев дали 6 FAIL до патча, затем PASS. В шаге 3 рабочее дерево не переключалось на baseline: отдельная копия создана через `git archive v2.8.0`, исходные Vue-компоненты в ней не менялись, порт тестового frontend — 3001. Пользовательская ручная приёмка, 30–50 кликов, соседние записи и корпоративный браузер остаются шагом 4, NOT RUN.

### После минимального патча — 2026-11-07, шаг 2

Коммит исправления: `6fd9d2fa611c5caf3a616233515a4a8097861e39`. Тот же базовый click-away сценарий: **6 FAIL до → 6 PASS после**. Дополненный E2E-набор: **11 PASS** в Chromium без retries:

```powershell
npm run e2e:silent -- click-away-annotation-mode.spec.ts --project=chromium --workers=1 --retries=0 --reporter=line --trace=on --output "$env:TEMP/argilla-focus-step2-results"
```

Результаты вынесены из frontend из-за Windows `EPERM` в Nuxt watcher на ZIP trace. Дополнительно проверены повторные клики по тексту/фону/заголовку текущего вопроса, отсутствие выбора/сохранения от самого клика, viewport scroll, contenteditable `123`, модификаторы и numpad. Для цифрового numpad используется CDP `key=2, code=Numpad2`: Playwright 1.49 по умолчанию отправляет `ArrowDown` для `Numpad2` (NumLock off). Этот один тест ограничен Chromium; другие браузеры ещё не запускались.

[QuestionsForm.spec.js](../argilla-frontend/components/features/annotation/container/questions/QuestionsForm.spec.js) добавляет **28 PASS**: безопасный возврат фокуса текущему вопросу, отказ для интерактивных элементов/другого control, overlays, выделения, модификаторов, disabled actions, saving, скрытого/удалённого варианта, отсутствия focus annotation mode. Вместе с двумя прежними component suites: **45 PASS**. Геометрия JSDOM подставлена, browser focus проверен отдельными E2E. Полная матрица, реальное открытие меню/модалок и клавиатурная навигация остаются шагом 3; ручная приёмка — шагом 4.

### Подтверждённый baseline — 2026-11-07

[click-away-annotation-mode.spec.ts](../argilla-frontend/e2e/annotation-mode-page/click-away-annotation-mode.spec.ts), коммит `ea79513d`, проверен на неизменённом frontend `v2.8.0` (`78cb5183`). Команда из `argilla-frontend`:

```powershell
npm run e2e:silent -- click-away-annotation-mode.spec.ts --project=chromium --workers=1 --retries=0 --reporter=line --trace=on
```

Результат: **6 FAIL / 1 PASS**. Все цифры `1/2/3` работают до click-away и перестают выбирать вариант после клика по тексту либо фону. Клик по варианту восстанавливает keyboard handler. Смена записи, URL и запросы сохранения исключены проверками; API полностью синтетический и не обращается к backend. Дополнительный обязательный текстовый вопрос предотвращает штатный auto-submit. Значит, проверяется единственный single-label вопрос, расположенный вторым, что также исключает случайный выбор первого вопроса при будущем исправлении.

В baseline trace вложен JSON `keyboard-focus`: до клика `INPUT#decision_yes`, индекс вопроса 1, путь клавиши проходит через контейнер вариантов; после `focusout` фокус `BODY`, индекс `null`, путь только `BODY → HTML → document → window`. Актуальные результаты после патча приведены выше и в таблице.

**Jest/Vue Test Utils:** смонтировать реальный компонент с вариантами/контекстом формы; инициировать `keydown` в режиме штатного фокуса, затем `blur` через клик по фону и повторить цифру. Если тестовая среда не воспроизводит настоящий browser focus, использовать Playwright для доказательства и отдельно проверить функцию guard-условий unit-тестами.

**Playwright E2E:** на синтетической записи открыть страницу; `click` на обычном элементе текста/пустом контейнере (предварительно убедившись, что это не интерактивный элемент); `keyboard.press("2")`; проверить состояние выбранного второго ответа и отсутствие лишних запросов отправки. Сделать такой же тест по крайней мере для `1/3`, поля поиска и диалога. Использовать существующие селекторы проекта, не придумывать атрибуты и не подменять `document.activeElement` искусственно вместо реального клика.

**До/после:** один и тот же автотест должен падать на исходной ветке и проходить на исправленной. По возможности приложить краткую обезличенную запись экрана/trace только с синтетическими данными.

## Запуск стенда для ручной проверки

В терминале с Node.js 20 (после остановки старого debug-запуска через Ctrl+C):

```powershell
cd H:\argilla\argilla\argilla-frontend
npm.cmd run annotation:manual
```

Команда сама поднимает локальный frontend, открывает Chromium, входит с синтетическими данными и показывает **10 текстов** с одним вопросом Decision и ответами Yes / No / Not sure. Notes отсутствует. После `MANUAL READY` можно свободно кликать и печатать: Inspector выключен, дальнейших автоматических действий и лимита времени нет. Закрытие окна Chromium либо Ctrl+C в терминале завершает сессию.

Работать нужно в открытом окне: API подменяется именно для него, настоящий backend не требуется. Ответы сохраняются **в памяти процесса стенда**. Можно переходить стрелками между записями, отправлять ответы, переключать Pending / Submitted и обновлять страницу. Перезапуск команды сбрасывает все 10 записей. Сохранение в реальный backend этим режимом не проверяется.

Для проверки на одной записи сначала выберите ответ **мышью**, затем кликните по фону или дважды/трижды по тексту и нажмите другую цифру. При одном вопросе `1/2/3` штатно выбирают ответ **и отправляют его с переходом дальше**. Это исходное поведение Argilla; механизм auto-submit не менялся. Для выбора без немедленной отправки используйте мышь, затем Submit. После всех десяти отправок выберите Submitted в фильтре статуса, чтобы посмотреть результаты.

[manual-records.fixture.ts](../argilla-frontend/e2e/manual/manual-records.fixture.ts) содержит только вымышленные тексты и API в памяти. [manual-records.spec.ts](../argilla-frontend/e2e/annotation-mode-page/manual-records.spec.ts) автоматически проверяет работу очереди. Завершение запуска не означает успешную ручную приёмку — её результат записывается отдельно. Ручной `.manual.ts` не входит в стандартный автоматизированный набор.

## Протокол ручной проверки (записать в PROGRESS.md)

```text
Дата/исполнитель:
Сборка/tag/SHA:
Среда (local/staging):
Браузер:
Одна и та же запись? да/нет
Области клика: фон / текст / другие безопасные зоны
Число click-away попыток:
Потерь shortcuts:
CA-01 ... CA-16: PASS/FAIL/BLOCKED
Неожиданные выборы, submit или навигация: да/нет
Тесты: реальные команды и результаты
Итог: PASS / FAIL / BLOCKED
```

## Приёмка

PASS на CA-01..CA-04 и критичных защитных CA-06..CA-10, CA-13, CA-14. Для остального — фактические результаты и объяснение блокеров. Основной критерий: **цифры работают после клика по неинтерактивному участку той же записи, не требуя повторного клика по варианту ответа**.
