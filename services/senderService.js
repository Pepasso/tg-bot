// services/senderService.js

const sqlite = require('sqlite-sync');

async function sendMessageToSeller(bot, tgId, message) {
  try {
    if (!tgId || isNaN(tgId)) {
      console.error('Некорректный tgId:', tgId);
      return false;
    }

    await bot.sendMessage(tgId, message, { parse_mode: 'HTML' });
    console.log(`✅ Сообщение отправлено продавцу: tgId=${tgId}`);
    return true;
  } catch (error) {
    if (error.response && error.response.body?.description?.includes('chat not found')) {
      console.warn('Продавец не найден или заблокировал бота.');
    } else {
      console.error('Ошибка отправки продавцу:', error.message);
    }
    return false;
  }
}

function getSellerChatId(username) {
  try {
    const query = `SELECT tgId FROM sellers WHERE username = ?`;
    const result = sqlite.run(query, [username]);
    return result.length > 0 ? result : null;
  } catch (error) {
    console.error('Ошибка при получении tgId по username:', error.message);
    return null;
  }
}

module.exports = {
  sendMessageToSeller,
  getSellerChatId
};
