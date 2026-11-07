# GITHUB_SETUP.md — GitHub, коммиты и Sync Changes в VS Code (Windows)

**Цель:** однажды подключить проект к GitHub так, чтобы потом сохранять отдельные версии понятными коммитами и отправлять их кнопкой **Sync Changes**. GitHub не заменяет локальный Git, а Sync не заменяет Commit.

## Что выбрать перед созданием репозитория

**Рекомендуемый вариант при неизвестных корпоративных правилах — приватный репозиторий с чистыми исходниками Argilla.** Согласовать с компанией, можно ли хранить корпоративные модификации на личном GitHub. Если нельзя — корпоративный GitHub/GitLab или только локальный Git до согласования. Не публикуй корпоративные исходники/конфигурацию/данные.

- **Путь A — приватный репозиторий** (`argilla-focus-fix`): для личной разработки на открытых исходниках, пока не согласован публичный PR. Создай на github.com новый **Private** репозиторий БЕЗ `README`, `.gitignore`, License, чтобы он был пустым. Если он уже создан не пустым, агент обязан выбрать безопасный способ без force push.
- **Путь B — публичный fork** `argilla-io/argilla`: для чистой upstream версии, если собираешься предложить исправление проекту и публикация разрешена. Нажать **Fork** в GitHub; исходный публичный код без корпоративных изменений.

В обоих вариантах агент должен проверить существующий `origin` прежде чем менять remotes. Не создавать второй вложенный `.git` внутри клона.

## Что нужно один раз установить

1. Git for Windows: https://git-scm.com/download/win
2. Visual Studio Code: https://code.visualstudio.com/
3. Аккаунт GitHub: https://github.com/
4. В терминале VS Code (`Terminal` → `New Terminal`) выполнить `git --version`.
5. Настроить подпись коммитов, заменив примеры своими значениями:

```powershell
git config --global user.name "Ваше имя или ник"
git config --global user.email "email-в-GitHub-или-GitHub-noreply"
```

6. При первом `Clone`, `Push` или `Sync` VS Code предложит **Sign in to GitHub** через браузер — войти самостоятельно. Агент не должен запрашивать пароль или токен в чате. Публикация/авторизация всегда проходит с твоего согласия.

## Путь A — чистая Argilla v2.8.0 → отдельный приватный репозиторий

Если локального проекта **ещё нет**, выполняй в PowerShell (агент может сделать команды при предоставленном доступе):

```powershell
git clone https://github.com/argilla-io/argilla.git argilla-focus
cd argilla-focus
git remote rename origin upstream
git switch -c baseline/argilla-v2.8.0 v2.8.0
# Создать пустой PRIVATE репозиторий в GitHub, затем:
git remote add origin https://github.com/<USERNAME>/<PRIVATE_REPO>.git
git push -u origin baseline/argilla-v2.8.0
git switch -c fix/annotation-shortcuts-click-away
git push -u origin fix/annotation-shortcuts-click-away
```

`<USERNAME>` и `<PRIVATE_REPO>` — заполняются реальными значениями. Не вставляй угловые скобки буквально. Если GitHub содержит уже существующие коммиты, остановись и покажи `git remote -v` и `git branch -avv`: слепой push здесь не подходит.

Теперь `origin` — твой приватный GitHub, `upstream` — оригинальный Argilla. Базовая ветка `baseline/argilla-v2.8.0` защищает точку отката; рабочая — `fix/annotation-shortcuts-click-away`. Не вносить исправление прямо в baseline.

**Если клонированный проект уже есть**, не выполняй `git clone` и не переименовывай remotes автоматически. Сначала:

```powershell
git status
git remote -v
git branch -avv
git describe --tags --always
git log -1 --oneline
```

Далее агент должен составить безопасную последовательность именно для этого состояния, сохранив текущие изменения.

## Путь B — публичный fork официального репозитория

1. Открыть https://github.com/argilla-io/argilla → **Fork** → создать fork в своём GitHub.
2. В VS Code: `Ctrl+Shift+P` → `Git: Clone` → вставить URL СВОЕГО fork → выбрать папку → Open Folder.
3. В терминале клона:

```powershell
git remote -v
# origin должен указывать на ВАШ fork
git remote add upstream https://github.com/argilla-io/argilla.git
git fetch upstream --tags
git switch -c fix/annotation-shortcuts-click-away v2.8.0
git push -u origin fix/annotation-shortcuts-click-away
```

Если `upstream` уже есть, не добавлять повторно. Если тег недоступен, агент сначала проверяет fetch/refs. Не создавать ветку от свежего `develop`, если задача привязана к 2.8.0 и это не согласовано.

**Примечание:** пользовательский fork от тега v2.8.0 можно использовать для собственной проверки. Перед upstream PR агент обязан отдельно проверить актуальную целевую ветку, правила контрибуции и совместимость патча, а не автоматически отправлять PR в несоответствующую ветку.

## Как сохранить изменения: всего несколько действий в VS Code

1. Открой вкладку **Source Control** (`Ctrl+Shift+G`).
2. Просмотри список изменённых файлов и diff (клик по имени файла).
3. Добавь нужные файлы в **Staged Changes** кнопкой `+` (или **Stage All Changes**, если проверены *все* файлы).
4. Впиши короткое сообщение: `fix: keep annotation shortcuts after clicking background`.
5. Нажми **Commit** — версия сохранена **локально**.
6. Нажми **Sync Changes** (круговые стрелки) — VS Code сначала подтянет удалённые изменения, затем отправит локальные коммиты в `origin` на текущую ветку.
7. Открой свой GitHub репозиторий → выбери `fix/annotation-shortcuts-click-away` → убедись, что новый commit появился.

**Важно:** простое сохранение файла (`Ctrl+S`) ничего не коммитит и не отправляет в GitHub. **Sync Changes не делает commit за тебя.** Если ветка без upstream, сначала кнопка `Publish Branch` или `git push -u origin <branch>`.

**Не включать автосинхронизацию/автокоммиты, пока не освоен контроль diff.** Если Sync сообщает о конфликтах, не жми снова наугад и не делай `force push`: покажи агенту точный текст ошибки.

## Как строить историю версий

Практичные сообщения:

```text
docs: add task and progress tracking
test: reproduce shortcut loss after background click
fix(frontend): keep shortcuts after clicking outside answers
test: cover keyboard navigation regression
docs: add staging and rollback notes
```

Один коммит — один связанный этап. Перед каждым Commit проверить, что нет `.env`, ключей, паролей, внутреннего домена, текстов пользователей, больших трасс браузера или `node_modules`.

## Как откатиться

- **Посмотреть историю:** Source Control Graph → выбрать commit → сравнить изменения; или `git log --oneline -10`.
- **Безопасно отменить уже отправленный коммит:** создать **Revert commit** через UI (при наличии действия) либо `git revert <SHA>` и затем `Sync Changes`. История сохраняется, коллегам не ломает ветку.
- **Вернуться к чистой версии для сравнения:** создать отдельную временную ветку от `baseline/argilla-v2.8.0`, не удаляя рабочую ветку.
- **Не использовать** `git reset --hard`, `git push --force`, `Discard All Changes` для «простого отката» без точного понимания последствий.
- **Деплой в компании не откатывается кнопкой Sync Changes**: отдельный rollback образа/артефакта у администратора.

## Ссылки на официальные инструкции

- VS Code Source Control: https://code.visualstudio.com/docs/sourcecontrol/overview
- VS Code — первый коммит и GitHub: https://code.visualstudio.com/docs/sourcecontrol/quickstart
- VS Code — Push/Pull/Sync: https://code.visualstudio.com/docs/sourcecontrol/repos-remotes
- VS Code — GitHub/forks/PR: https://code.visualstudio.com/docs/sourcecontrol/github
