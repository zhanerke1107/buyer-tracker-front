# BuyerTrack — Front (React + Vite)

Фронтенд BuyerTrack, свёрстанный по дизайну из архива «Короткая форма дизайна приложения»
(дизайн-система Buyer-Track: Poppins, фиолетовый `#553FE9`, иконки Phosphor, карта Leaflet/OSM).

## Запуск

```powershell
npm install
npm run dev
```

Откройте http://localhost:5173. Сборка: `npm run build` (результат в `dist/`).

## Экраны

- **Вход / регистрация** (байер / клиент)
- **Главная**: KPI, карта маршрутов, «Требуют внимания», последние обновления, ближайшие доставки; вариант «Конвейер»
- **Заказы**: таблица / по клиентам, поиск, фильтры, экспорт CSV; карточка заказа (drawer)
- **Отправления**: сборка посылок drag & drop / список и детали
- **Карта маршрутов**: подтверждённый путь и план
- **Публичное отслеживание** `#/track/<код>` без регистрации
- Модалки: новый заказ, отправление, обновление статуса, подтверждение удаления

Адаптивность: при ширине < 860px включается мобильная раскладка с нижним таб-баром.

## Структура

```
src/
  styles/        токены дизайн-системы (colors, typography, spacing) + global.css
  lib/core.js    константы, форматирование, демо-данные, derive()
  lib/actions.js действия (заказы, отправления, статусы, CSV)
  lib/vm.js      view-model: готовые к рендеру данные для экранов
  lib/useStore.js состояние приложения + сохранение в localStorage
  components/    UI-примитивы (Button, IconButton, SearchBar...), Layout, RouteMap, OrderDrawer, Modals
  screens/       Auth, Track, Dashboard, Orders, Shipments, MapScreen
```

Данные хранятся в бэкенде `../Buyer-track-back` (FastAPI + SQLite). Запустите его на :8000 — Vite проксирует `/api` туда (`src/lib/api.js`).
