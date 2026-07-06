# English Coach

Личный AI-продукт для изучения английского под remote-работу.  
Собран одним человеком с помощью vibe-coding (Cursor + Claude).

**Демо:** [english-coach-lime.vercel.app](https://english-coach-lime.vercel.app)

## Что внутри

| Модуль | Описание |
|--------|----------|
| **Vocabulary** | Словарь с фильтрами, категориями, IPA и примерами |
| **Flashcards** | Карточки с алгоритмом интервальных повторений SM-2 |
| **Grammar** | Упражнения по темам с прогрессом |
| **Reading** | Тексты с вопросами и сохранением слов |
| **Writing** | Задания + авто-проверка грамматики и clarity score |
| **Speaking** | Speech-to-text + LLM-фидбек по произношению |
| **Job English** | Профессиональная лексика: support, ops, PM, SaaS, remote |
| **Dashboard** | Streak, цели, статистика, график за неделю |

## Стек

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **State:** Zustand
- **DB:** SQLite (локально) + Neon Postgres (Vercel)
- **AI:** Ollama (speaking feedback), rule-based grammar checker
- **Deploy:** Vercel

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

### Заполнить базу тестовыми данными

```bash
npx tsx scripts/seed.ts
```

## Структура проекта

```
src/
  app/           # страницы и API routes
  components/    # UI-компоненты
  lib/           # db, schema, SM-2, grammar checker
  stores/        # Zustand stores
data/
  seed/          # JSON с контентом (слова, тексты, упражнения)
scripts/
  seed.ts        # загрузка seed-данных в SQLite
```

## Как это связано с подходом «один человек = команда»

Продукт не копировался с шаблона — каждый модуль проектировался под конкретную задачу обучения.  
Контент структурирован в JSON, загружается скриптом, хранится в БД.  
Тот же принцип применим к любой рутине: контент → скрипт → база → готовый инструмент.
