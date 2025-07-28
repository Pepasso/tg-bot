// handlers/startHandler.js

const sqlite = require('sqlite-sync');
const {
  sendMainMenu
} = require('../utils/ui');

function registerStartCommand(bot) {
  bot.onText(/\/start/, (msg) => {
    const userId = msg.from.id;
    const userName = msg.from.username || 'unknown';
    const command = '/start';

    if (!userId) {
      console.error('Ошибка: user_id не определен');
      return;
    }

    sqlite.run(
      'INSERT INTO command_logs (user_id, username, command) VALUES (?, ?, ?)',
      [userId, userName, command],
      function (err) {
        if (err) {
          console.error('Ошибка записи:', err);
        } else {
          console.log('Запись добавлена, ID:', this.lastID);
        }
        sendMainMenu(bot, msg.chat.id);
      }
    );
  });
}

module.exports = {
  registerStartCommand
};
