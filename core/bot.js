// core/bot.js

const TelegramBot = require('node-telegram-bot-api');
const config = require('../config'); // config.token должен быть определён

// Инициализация бота с polling
const bot = new TelegramBot(config.token, {
  polling: true
});

module.exports = bot;