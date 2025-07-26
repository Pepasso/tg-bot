// core/sqlite.js

const sqlite = require('sqlite-sync');
const path = require('path');

// Открытие базы данных (файл будет создан, если его нет)
const dbPath = path.resolve(__dirname, '../library.db');
const db = sqlite.connect(dbPath);

// Создание таблицы для логов, если не существует
db.run(`
  CREATE TABLE IF NOT EXISTS command_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    command TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;