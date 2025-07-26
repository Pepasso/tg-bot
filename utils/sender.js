            const sellerTgId = parseInt(getSellerChatId(part.chatUsername)[0].tgId);

            if (sellerTgId) {
              // Генерируем уникальный ID для запроса
              const uniqueId = Math.random().toString(36).substring(2, 8);

              // Подготавливаем сообщение для продавца
              const sellerMessage = `
Марка: ${brand}
Качество: ${selectedFresh}
Категория: ${selectedCarCategory}
Клиент: ${query.message.from.first_name} (${query.message.from.id})
`;

              // Отправляем сообщение продавцу
              const isSent = await sendMessageToSeller(sellerTgId, sellerMessage);

              if (isSent) {
                // Создаем клавиатуру с кнопкой "Начать чат"
                const chatUrl = `tg://resolve?domain=${encodeURIComponent(part.chatUsername)}`;
                const chatKeyboard = {
                  bot.sendPhoto(chatId, require('fs').createReadStream(part.image), {
                    caption: clientMessageText,
                    parse_mode: 'HTML',
            const sellerTgId = getSellerChatId(service.chatUsername)[0].tgId;

            if (sellerTgId) {
              const uniqueId = Math.random().toString(36).substring(2, 8);
              const sellerMessage = `
Услуга: ${originalServiceKey}
Клиент: ${query.message.from.first_name} (${query.message.from.id})
`;

              const isSent = await sendMessageToSeller(sellerTgId, sellerMessage);

              if (isSent) {
                const chatUrl = `tg://resolve?domain=${encodeURIComponent(service.chatUsername)}`;
                const keyboard = {
                  bot.sendPhoto(chatId, require('fs').createReadStream(service.image), {
                    caption: clientMessage,
                    parse_mode: 'HTML',
              bot.sendPhoto(chatId, require('fs').createReadStream(service.image), {
                caption: clientMessage,
                parse_mode: 'HTML',
            const sellerTgId = getSellerChatId(lawyer.chatUsername)[0].tgId;

            if (sellerTgId) {
              const uniqueId = Math.random().toString(36).substring(2, 8);
              const sellerMessage = `
  Юридическая помощь: ${originalLawyerKey}
  Клиент: ${query.message.from.first_name} (${query.message.from.id})
  `;

              const isSent = await sendMessageToSeller(sellerTgId, sellerMessage);

              if (isSent) {
                const chatUrl = `tg://resolve?domain=${encodeURIComponent(lawyer.chatUsername)}`;
                const keyboard = {
                  bot.sendPhoto(chatId, require('fs').createReadStream(lawyer.image), {
                    caption: clientMessage,
                    parse_mode: 'HTML',
              bot.sendPhoto(chatId, require('fs').createReadStream(lawyer.image), {
                caption: clientMessage,
                parse_mode: 'HTML',
function getSellerChatId(username) {
  try {
    const query = `SELECT tgId FROM sellers WHERE username = '${username}'`;
    const result = sqlite.run(query); // Используем параметризованный запрос
    console.log(`Query: ${query}, Username: ${username}`);
    console.log('Result:', result);
    return result ? result : null; // Возвращаем tgId, если запись найдена
  } catch (error) {
    console.error('Ошибка при получении tgId по username:', error.message);
    return null;
  }
}

function getAndreyChatId() {
  try {
    const query = `SELECT tgId, username FROM sellers WHERE id = 2`;
    const result = sqlite.run(query); // Используем параметризованный запрос
    return result ? result : null; // Возвращаем tgId, если запись найдена
  } catch (error) {
    console.error('Ошибка при получении tgId по username:', error.message);
    return null;
  }
}

// Функция для отправки сообщения продавцу
async function sendMessageToSeller(tgId, message) {
  try {
    if (!tgId || isNaN(tgId)) {
      console.error('Некорректный tgId:', tgId);
      return false; // Возвращаем false, если tgId недействителен
    }

    // Отправляем сообщение продавцу
    await bot.sendMessage(tgId, message, {
      parse_mode: 'HTML'
    });
    console.log(`Сообщение успешно отправлено продавцу с tgId=${tgId}.`);
    return true;
  } catch (error) {
    if (error.response && error.response.body.description.includes('chat not found')) {
      console.error('Продавец не найден или заблокировал бота.');
    } else {
      console.error('Ошибка при отправке сообщения продавцу:', error.message);
    }
    return false;
  }
}

// Функция для получения chatId по username
async function getChatIdByUsername(username) {
  try {
    const chat = await bot.getChat(`@${username}`);
    return chat.id;
  } catch (error) {
    console.error('Ошибка при получении chatId по username:', error);
    return null; // Возвращаем null, если чат не найден
  }
}

if (admin) {
  bot.onText(/\/register_seller/, async (msg) => {
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
}

function showCategoryKeyboard(chatId) {
  const categoryKeyboard = {
