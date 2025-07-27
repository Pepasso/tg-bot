// utils/ui.js

function sendMainMenu(bot, chatId, messageIdToDelete = null) {
  if (messageIdToDelete) {
    bot.deleteMessage(chatId, messageIdToDelete).catch((error) => {
      console.log('Не удалось удалить сообщение:', error.message);
    });
  }

  const keyboard = {
    inline_keyboard: [
      [{
        text: '🔍 Найти запчасти',
        callback_data: 'find_command'
      }],
      [{
        text: '🔧 Выбрать сервис',
        callback_data: 'command_service'
      }],
      [{
        text: '⚖️ Выбрать юр.услугу',
        callback_data: 'command_lawyer'
      }],
      [{
        text: '💸🚙 Продать/купить авто',
        callback_data: 'sell_command'
      }],
      [{
        text: '🛞 Шины/диски',
        callback_data: 'products_command'
      }],
      [{
        text: '🔗 Гаечкин Новокузнецк',
        url: 'https://t.me/Gae4kinNVKZ'
      }],
      [{
        text: '❓ Помощь',
        callback_data: 'help_command'
      }],
    ],
  };

  bot.sendMessage(chatId, '🚗 Добро пожаловать в ГаечкинBot! Выберите действие:', {
    reply_markup: keyboard,
  });
}

module.exports = {
  sendMainMenu
};