const TelegramBot = require('node-telegram-bot-api');
const sqlite = require('sqlite-sync');
const config = require('./config.json');
//import('.add-db.js');
//import('.add-numbers.js');
//Connecting - if the file does not exist it will be created
sqlite.connect(config.db);


sqlite.run(`CREATE TABLE IF NOT EXISTS audi(
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  address TEXT,
  name TEXT,
  from_id INTEGER,
  message_id INTEGER
);`, function (res) {
  if (res.error)
    throw res.error;
});

sqlite.run(`CREATE TABLE IF NOT EXISTS bmw(
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  address TEXT,
  name TEXT,
  from_id INTEGER,
  message_id INTEGER
);`, function (res) {
  if (res.error)
    throw res.error;
});


// replace the value below with the Telegram token you receive from @BotFather
const token = config.token;
const admin = config.admin;

const bot = new TelegramBot(token, {
  polling: true,
  filepath: false
});

// Start description
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Этот бот поможет вам найти нужные запчасти, для вашего авто.\n' +
    'Для поиска введите:\n' +
    '`/find марка вашей машины`\n', {
      parse_mode: 'markdown'
    });
});

const models = ['audi', 'bmw'];
let model; // Глобальная переменная для хранения значения model
const addMode = {};
let countStep = 1;

// Retrieve message from database
bot.onText(/\/find ([^;'\"]+)/, (msg, match) => {
  model = null;
  //const key = match[1];
  //const message = getMessage(key);
  //if (message.exists) {
  //bot.forwardMessage(msg.chat.id, message.from_id, message.message_id);
  //}
  const chatId = msg.chat.id;
  const key = match[1];
  const uniqueKey = key + Date.now(); // Генерация уникального ключа
  console.log(key)
  if (models.includes(key) && uniqueKey) {
    model = findModel(key);
    addMode[chatId] = {
      key: uniqueKey,
      from: msg.from.id
    };
    bot.sendMessage(chatId, 'Теперь введите марку вашей машины:');
  } else {
    bot.sendMessage(chatId, 'Можете связаться с одним из ниже перечисленных номеров:');
    bot.sendMessage(chatId, '(тестовый номер)');
  }
});

// Add message to database
bot.onText(/\/add ([^;'\"]+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const key = match[1];
  var text = '';
  if (isMessageExists(key)) {
    text = 'Sorry, message with this key already exists.';
  } else {
    addMode[chatId] = {
      key: key,
      from: msg.from.id
    };
    text = 'Now send me a message that needs to be saved. ' +
      'Or /cancel to abort operation.';
  }
  bot.sendMessage(chatId, text);
});

bot.onText(/(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (!messageText.startsWith('/find')) {
    if (chatId in addMode) {
      if (countStep == 1) {
        processCarDetailInput(chatId, msg.text, 1);
        countStep++;
      } else if (countStep == 2) {
        processCarDetailInput(chatId, msg.text, 2);
        countStep = 1;
      }
    }
  }
});

// Get list of messages for current user
bot.onText(/\/list/, (msg) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const data = sqlite.run(
    "SELECT `key` FROM messages WHERE `from_id` = ?",
    [fromId]);
  if (data.length == 0) {
    bot.sendMessage(chatId, 'You have not added anything.');
    return;
  }
  var lines = [];
  data.forEach(function (element) {
    lines.push('`' + element.key + '`');
  });
  bot.sendMessage(chatId, lines.join(', '), {
    parse_mode: 'markdown'
  });
});

// Remove message from database
bot.onText(/\/remove ([^;'\"]+)/, (msg, match) => {
  const key = match[1];
  const message = getMessage(key);
  if (!message.exists) return;
  if (message.from_id != msg.from.id) return;

  sqlite.delete('messages', {
    'key': key
  }, function (res) {
    if (!res.error) {
      bot.sendMessage(msg.chat.id, 'Message successfully deleted!');
    }
  });
});

function isMessageExists(key) {
  return sqlite.run(
    "SELECT COUNT(*) as cnt FROM messages WHERE `key` = ?",
    [key])[0].cnt != 0;
}

function getMessage(key) {
  const data = sqlite.run(
    "SELECT * FROM messages WHERE `key` = ? LIMIT 1",
    [key]);
  if (data.length == 0) {
    return {
      exists: false
    };
  }
  data[0].exists = true;
  return data[0];
}

function findModel(key) {
  if (models.includes(key)) {
    const query = `SELECT key, address, name FROM ${key};`;
    const model = sqlite.run(query);
    return model; // Предполагаем, что 'model' - это массив объектов
  } else {
    return false;
  }
}

function processCarDetailInput(chatId, detail, step) {
  if (step == 1) {
    bot.sendMessage(chatId, 'Теперь укажите деталь вашей машины:');
  } else if (step == 2) {
    bot.sendMessage(chatId, 'Предлагаем вам связаться с одним из ниже перечисленных номеров:');

    const modelData = model;
    if (modelData) {
      modelData.forEach(function (element) {
        const name = element.name ? element.name : 'не указано';
        const address = element.address ? element.address : 'не указано';
        const message = `Название компании: ${name},\nАдрес компании: ${address},\nНомер компании: ${element.key}`;
        bot.sendMessage(chatId, message);
      });
    } else {
      bot.sendMessage(chatId, 'Данные по запрошенному ключу не найдены.');
    }

    delete addMode[chatId]; // Предполагая, что 'addMode' - это структура данных для отслеживания состояния
  }
}

//sqlite.insert('bmw', {
//key: "+7-444-111-4444",
//address: 'пр. Дружбы 29',
//name: 'Название компании3',
//from_id: 1065942312,
//message_id: 15
//});

//sqlite.run(
//`ALTER TABLE audi ADD COLUMN name TEXT;`,
//function (res) {
//if (res.error)
//throw res.error;
// });