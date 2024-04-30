const sqlite = require('sqlite-sync');

sqlite.run(`CREATE TABLE IF NOT EXISTS audi(
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  from_id INTEGER NOT NULL,
  message_id INTEGER NOT NULL
);`, function (res) {
  if (res.error)
    throw res.error;
});

sqlite.run(`CREATE TABLE IF NOT EXISTS bmw(
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  from_id INTEGER NOT NULL,
  message_id INTEGER NOT NULL
);`, function (res) {
  if (res.error)
    throw res.error;
});