import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');
const SEED_DIR = path.join(process.cwd(), 'data', 'seed');

function main() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      ipa TEXT NOT NULL DEFAULT '',
      pos TEXT NOT NULL DEFAULT '',
      translation TEXT NOT NULL DEFAULT '',
      examples TEXT NOT NULL DEFAULT '[]',
      synonyms TEXT NOT NULL DEFAULT '[]',
      difficulty INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL DEFAULT 'manual',
      category TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL UNIQUE REFERENCES words(id) ON DELETE CASCADE,
      state TEXT NOT NULL DEFAULT 'new',
      ease_factor REAL NOT NULL DEFAULT 2.5,
      interval INTEGER NOT NULL DEFAULT 0,
      repetitions INTEGER NOT NULL DEFAULT 0,
      next_review TEXT NOT NULL DEFAULT (datetime('now')),
      last_review TEXT,
      lapses INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
      quality INTEGER NOT NULL,
      prev_state TEXT NOT NULL,
      new_state TEXT NOT NULL,
      prev_interval INTEGER NOT NULL,
      new_interval INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      reviews_done INTEGER NOT NULL DEFAULT 0,
      new_words INTEGER NOT NULL DEFAULT 0,
      accuracy REAL,
      minutes INTEGER NOT NULL DEFAULT 0,
      streak_day INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS grammar_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      subtopic TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL,
      difficulty INTEGER NOT NULL DEFAULT 1,
      prompt TEXT NOT NULL,
      context TEXT NOT NULL DEFAULT '',
      options TEXT NOT NULL DEFAULT '[]',
      answer TEXT NOT NULL,
      explanation TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS grammar_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL UNIQUE,
      exercises_done INTEGER NOT NULL DEFAULT 0,
      correct INTEGER NOT NULL DEFAULT 0,
      last_practiced TEXT
    );
    CREATE TABLE IF NOT EXISTS reading_texts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      vocab_ids TEXT NOT NULL DEFAULT '[]',
      word_count INTEGER NOT NULL DEFAULT 0,
      questions TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reading_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text_id INTEGER NOT NULL REFERENCES reading_texts(id),
      completed INTEGER NOT NULL DEFAULT 0,
      words_saved INTEGER NOT NULL DEFAULT 0,
      read_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS writing_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      scenario TEXT NOT NULL,
      prompt TEXT NOT NULL,
      context TEXT NOT NULL DEFAULT '',
      checklist TEXT NOT NULL DEFAULT '[]',
      sample TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS writing_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER REFERENCES writing_tasks(id),
      content TEXT NOT NULL,
      score REAL,
      feedback TEXT NOT NULL DEFAULT '{}',
      submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed vocabulary
  const vocabData = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'vocabulary.json'), 'utf-8'));
  const insertWord = db.prepare(
    'INSERT INTO words (word, ipa, pos, translation, examples, synonyms, difficulty, source, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertReview = db.prepare(
    'INSERT INTO reviews (word_id, state) VALUES (?, ?)'
  );

  const wordCount = db.prepare('SELECT COUNT(*) as c FROM words').get() as { c: number };
  if (wordCount.c === 0) {
    const tx = db.transaction(() => {
      for (const w of vocabData) {
        const result = insertWord.run(
          w.word, w.ipa, w.pos, w.translation,
          JSON.stringify(w.examples), JSON.stringify(w.synonyms),
          w.difficulty, 'manual', ''
        );
        insertReview.run(result.lastInsertRowid, 'new');
      }
    });
    tx();
    console.log(`Seeded ${vocabData.length} vocabulary words`);
  } else {
    console.log(`Vocabulary already has ${wordCount.c} words, skipping`);
  }

  // Seed job vocabulary
  const jobData = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'job-vocabulary.json'), 'utf-8'));
  const jobWordCount = db.prepare("SELECT COUNT(*) as c FROM words WHERE source = 'job-english'").get() as { c: number };
  if (jobWordCount.c === 0) {
    const tx = db.transaction(() => {
      for (const [category, words] of Object.entries(jobData) as [string, any[]][]) {
        for (const w of words) {
          const result = insertWord.run(
            w.word, w.ipa, w.pos, w.translation,
            JSON.stringify(w.examples), JSON.stringify(w.synonyms),
            w.difficulty, 'job-english', category
          );
          insertReview.run(result.lastInsertRowid, 'new');
        }
      }
    });
    tx();
    const total = Object.values(jobData).reduce((sum: number, arr: any) => sum + arr.length, 0);
    console.log(`Seeded ${total} job English terms`);
  } else {
    console.log(`Job vocabulary already has ${jobWordCount.c} terms, skipping`);
  }

  // Seed grammar exercises
  const grammarData = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'grammar-exercises.json'), 'utf-8'));
  const grammarCount = db.prepare('SELECT COUNT(*) as c FROM grammar_exercises').get() as { c: number };
  if (grammarCount.c === 0) {
    const insertGrammar = db.prepare(
      'INSERT INTO grammar_exercises (topic, subtopic, type, difficulty, prompt, context, options, answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const tx = db.transaction(() => {
      for (const e of grammarData) {
        insertGrammar.run(
          e.topic, e.subtopic, e.type, e.difficulty,
          e.prompt, e.context, JSON.stringify(e.options),
          e.answer, e.explanation
        );
      }
    });
    tx();
    console.log(`Seeded ${grammarData.length} grammar exercises`);
  } else {
    console.log(`Grammar already has ${grammarCount.c} exercises, skipping`);
  }

  // Seed reading texts
  const readingData = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'reading-texts.json'), 'utf-8'));
  const readingCount = db.prepare('SELECT COUNT(*) as c FROM reading_texts').get() as { c: number };
  if (readingCount.c === 0) {
    const insertReading = db.prepare(
      'INSERT INTO reading_texts (title, level, category, body, vocab_ids, word_count, questions) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const tx = db.transaction(() => {
      for (const t of readingData) {
        const wordCount = t.body.split(/\s+/).length;
        insertReading.run(
          t.title, t.level, t.category, t.body,
          JSON.stringify(t.vocabHighlights), wordCount,
          JSON.stringify(t.questions || [])
        );
      }
    });
    tx();
    console.log(`Seeded ${readingData.length} reading texts`);
  } else {
    console.log(`Reading already has ${readingCount.c} texts, skipping`);
  }

  // Seed writing tasks
  const writingData = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'writing-tasks.json'), 'utf-8'));
  const writingCount = db.prepare('SELECT COUNT(*) as c FROM writing_tasks').get() as { c: number };
  if (writingCount.c === 0) {
    const insertWriting = db.prepare(
      'INSERT INTO writing_tasks (type, scenario, prompt, context, checklist, sample) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const tx = db.transaction(() => {
      for (const t of writingData) {
        insertWriting.run(
          t.type, t.scenario, t.prompt, t.context,
          JSON.stringify(t.checklist), t.sample
        );
      }
    });
    tx();
    console.log(`Seeded ${writingData.length} writing tasks`);
  } else {
    console.log(`Writing already has ${writingCount.c} tasks, skipping`);
  }

  // Default settings
  const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number };
  if (settingsCount.c === 0) {
    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('daily_goal', '20');
    insertSetting.run('theme', 'dark');
    insertSetting.run('new_cards_per_day', '10');
    insertSetting.run('reviews_per_session', '30');
    console.log('Seeded default settings');
  }

  db.close();
  console.log('Done!');
}

main();
