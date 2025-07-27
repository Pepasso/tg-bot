// handlers/adminHandler.js

const sqlite = require('sqlite-sync');

function registerAdminCommands(bot) {
  bot.onText(/\/register_seller/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || 'no_username';

    try {
      sqlite.run("INSERT OR REPLACE INTO sellers (username, tgId) VALUES (?, ?)", [username, chatId]);
      bot.sendMessage(chatId, 'Вы успешно зарегистрированы как продавец!');
    } catch (error) {
      console.error('Ошибка при регистрации продавца:', error);
      bot.sendMessage(chatId, 'Произошла ошибка при регистрации.');
    }
  });

  bot.onText(/\/list/, (msg) => {
    const chatId = msg.chat.id;
    const fromId = msg.from.id;
    const data = sqlite.run("SELECT `key` FROM messages WHERE `from_id` = ?", [fromId]);

    if (!data || data.length === 0) {
      bot.sendMessage(chatId, 'Вы ничего не добавляли.');
    } else {
      const lines = data.map((row) => '`' + row.key + '`');
      bot.sendMessage(chatId, lines.join(', '), { parse_mode: 'markdown' });
    }
  });

  bot.onText(/\/remove ([^;'"]+)/, (msg, match) => {
    const key = match[1];
    const message = getMessage(key);

    if (!message.exists) return;
    if (message.from_id !== msg.from.id) return;

    sqlite.delete('messages', { key }, (res) => {
      if (!res.error) {
        bot.sendMessage(msg.chat.id, 'Сообщение удалено!');
      }
    });
  });

  bot.onText(/\/add ([^;'"]+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const key = match[1];
    if (isMessageExists(key)) {
      return bot.sendMessage(chatId, '❗ Сообщение с этим ключом уже существует.');
    }

    bot.sendMessage(chatId, 'Теперь отправьте сообщение, которое нужно сохранить.').then(() => {
      const addHandler = (msg2) => {
        bot.removeListener('message', addHandler);
        sqlite.insert("messages", {
          key,
          message_id: msg2.message_id,
          from_id: msg.from.id,
        });
        bot.sendMessage(chatId, '✅ Сообщение сохранено.');
      };

      bot.on('message', addHandler);
    });
  });
}

function getMessage(key) {
  const data = sqlite.run("SELECT * FROM messages WHERE `key` = ? LIMIT 1", [key]);
  if (!data || data.length === 0) return { exists: false };
  data[0].exists = true;
  return data[0];
}

function isMessageExists(key) {
  const data = sqlite.run("SELECT COUNT(*) as cnt FROM messages WHERE `key` = ?", [key]);
  return data[0].cnt > 0;
}

module.exports = { registerAdminCommands };
