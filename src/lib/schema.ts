import { getDb } from './db';

export function initSchema(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      word        TEXT NOT NULL,
      ipa         TEXT NOT NULL DEFAULT '',
      pos         TEXT NOT NULL DEFAULT '',
      translation TEXT NOT NULL DEFAULT '',
      examples    TEXT NOT NULL DEFAULT '[]',
      synonyms    TEXT NOT NULL DEFAULT '[]',
      difficulty  INTEGER NOT NULL DEFAULT 1,
      source      TEXT NOT NULL DEFAULT 'manual',
      category    TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id     INTEGER NOT NULL UNIQUE REFERENCES words(id) ON DELETE CASCADE,
      state       TEXT NOT NULL DEFAULT 'new',
      ease_factor REAL NOT NULL DEFAULT 2.5,
      interval    INTEGER NOT NULL DEFAULT 0,
      repetitions INTEGER NOT NULL DEFAULT 0,
      next_review TEXT NOT NULL DEFAULT (datetime('now')),
      last_review TEXT,
      lapses      INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS review_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id     INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
      quality     INTEGER NOT NULL,
      prev_state  TEXT NOT NULL,
      new_state   TEXT NOT NULL,
      prev_interval INTEGER NOT NULL,
      new_interval  INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT NOT NULL UNIQUE,
      reviews_done INTEGER NOT NULL DEFAULT 0,
      new_words   INTEGER NOT NULL DEFAULT 0,
      accuracy    REAL,
      minutes     INTEGER NOT NULL DEFAULT 0,
      streak_day  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS grammar_exercises (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      topic       TEXT NOT NULL,
      subtopic    TEXT NOT NULL DEFAULT '',
      type        TEXT NOT NULL,
      difficulty  INTEGER NOT NULL DEFAULT 1,
      prompt      TEXT NOT NULL,
      context     TEXT NOT NULL DEFAULT '',
      options     TEXT NOT NULL DEFAULT '[]',
      answer      TEXT NOT NULL,
      explanation TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS grammar_progress (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      topic       TEXT NOT NULL UNIQUE,
      exercises_done INTEGER NOT NULL DEFAULT 0,
      correct     INTEGER NOT NULL DEFAULT 0,
      last_practiced TEXT
    );

    CREATE TABLE IF NOT EXISTS reading_texts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      level       TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT '',
      body        TEXT NOT NULL,
      vocab_ids   TEXT NOT NULL DEFAULT '[]',
      word_count  INTEGER NOT NULL DEFAULT 0,
      questions   TEXT NOT NULL DEFAULT '[]',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      text_id     INTEGER NOT NULL REFERENCES reading_texts(id),
      completed   INTEGER NOT NULL DEFAULT 0,
      words_saved INTEGER NOT NULL DEFAULT 0,
      read_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS writing_tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      type        TEXT NOT NULL,
      scenario    TEXT NOT NULL,
      prompt      TEXT NOT NULL,
      context     TEXT NOT NULL DEFAULT '',
      checklist   TEXT NOT NULL DEFAULT '[]',
      sample      TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS writing_submissions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id     INTEGER REFERENCES writing_tasks(id),
      content     TEXT NOT NULL,
      score       REAL,
      feedback    TEXT NOT NULL DEFAULT '{}',
      submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
    CREATE INDEX IF NOT EXISTS idx_words_source ON words(source);
    CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
    CREATE INDEX IF NOT EXISTS idx_reviews_next ON reviews(next_review);
    CREATE INDEX IF NOT EXISTS idx_reviews_state ON reviews(state);
    CREATE INDEX IF NOT EXISTS idx_review_log_word ON review_log(word_id);
    CREATE INDEX IF NOT EXISTS idx_review_log_date ON review_log(reviewed_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON study_sessions(date);
    CREATE INDEX IF NOT EXISTS idx_grammar_topic ON grammar_exercises(topic);
    CREATE INDEX IF NOT EXISTS idx_reading_level ON reading_texts(level);
  `);

  const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number };
  if (settingsCount.c === 0) {
    const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    insert.run('daily_goal', '20');
    insert.run('theme', 'dark');
    insert.run('new_cards_per_day', '10');
    insert.run('reviews_per_session', '30');
  }
}
