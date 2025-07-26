const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const bot = new TelegramBot(config.token, { polling: true });

const handleStart = require('./handlers/startHandler');
const handleCallback = require('./handlers/callbackHandler');
const handleContact = require('./handlers/contactHandler');
const handleText = require('./handlers/textHandler');

bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.on('callback_query', (query) => handleCallback(bot, query));
bot.on('message', (msg) => {
  if (msg.contact) return handleContact(bot, msg);
  return handleText(bot, msg);
});
