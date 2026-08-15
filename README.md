# Интерактивный генплан КП «Альбатрос»

Готовая серверная версия: публичный модуль, SQLite, админка, заявки, загрузка фото, цели Метрики, Telegram и универсальный CRM-webhook.

## Запуск

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export ADMIN_PASSWORD='надежный-пароль'
export SESSION_SECRET='длинная-случайная-строка'
uvicorn app:app --host 0.0.0.0 --port 8000
```

Открыть:
- Генплан: http://localhost:8000/
- Админка: http://localhost:8000/admin

## Настройки
Скопируйте `.env.example` и передайте значения как переменные окружения. Для production рекомендуется запуск через Docker/systemd и Nginx с HTTPS.

- `METRIKA_ID` — номер счетчика Яндекс Метрики.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — отправка заявок в Telegram.
- `CRM_WEBHOOK_URL` — POST JSON каждой заявки в CRM/Albato/Make.

## Встраивание
Работает независимо от Тильды. На Тильде, WordPress, Битриксе или другом сайте:
```html
<iframe src="https://genplan.example.ru/" width="100%" style="border:0;min-height:760px" loading="lazy"></iframe>
```
Для автоматической высоты можно добавить обмен `postMessage`, но текущая карта полностью масштабируется по ширине и не обрезается.

## Персональные данные
Страницы `/privacy` и `/consent` содержат заглушки. Перед запуском их должен утвердить юрист/оператор данных. Чекбокс не предустановлен; факт согласия, версия текста, источник и user-agent сохраняются в базе.


## Статистика участков
В админке можно включать/выключать нижний блок статистики, отдельно показывать свободные и проданные участки и менять подписи. Значения считаются автоматически из базы по статусам `free` и `busy`.
