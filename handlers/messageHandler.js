// handlers/messageHandler.js

const {
  sendMessageToSeller
} = require('../services/senderService');
const sqlite = require('sqlite-sync');

function registerMessageHandler(bot, state) {
  bot.on('message', async (msg) => {
    // Контакт от пользователя — только в случае активного ожидания
    if (msg.contact) {
      const seller = getAndreyChatId();
      if (seller && seller.length > 0) {
        const sellerMessage = `
📱 Новый контакт от клиента:
Имя: ${msg.from.first_name}
Телефон: ${msg.contact.phone_number}`;
        await sendMessageToSeller(bot, seller[0].tgId, sellerMessage);
        bot.sendMessage(msg.chat.id, '✅ Контакт отправлен продавцу!');
      }
    }
  });
}

function getAndreyChatId() {
  try {
    const query = `SELECT tgId, username FROM sellers WHERE id = 2`;
    const result = sqlite.run(query);
    return result ? result : null;
  } catch (error) {
    console.error('Ошибка при получении chatId Андрея:', error);
    return null;
  }
}

module.exports = {
  registerMessageHandler
};