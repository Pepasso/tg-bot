// utils/ui/mainMenu.js

const bot = require('../../core/bot');

function sendMainMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [{
        text: "🔍 Найти запчасти",
        callback_data: "find_command"
      }],
      [{
        text: "🔧 Выбрать сервис",
        callback_data: "service_command"
      }],
      [{
        text: "⚖️ Юр. услуги",
        callback_data: "law_command"
      }],
      [{
        text: "🚘 Продать авто",
        callback_data: "sell_command"
      }],
      [{
        text: "🛒 Аксессуары и товары",
        callback_data: "products_command"
      }]
    ]
  };

  bot.sendMessage(chatId, '🚗 Добро пожаловать в ГаечкинBot! Выберите действие:', {
    reply_markup: keyboard
  });
}

module.exports = {
  sendMainMenu
};