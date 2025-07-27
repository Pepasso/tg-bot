// services/searchService.js

const sqlite = require('sqlite-sync');
const {
  delay
} = require('../utils/textUtils');

const ITEMS_PER_PAGE = 15;

function paginateResults(results, page) {
  if (!Array.isArray(results)) return [];
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return results.slice(start, end);
}

function buildPaginationButtons(entity, page, totalItems, identifier) {
  const buttons = [];
  if (page > 0) {
    buttons.push({
      text: '⬅️ Назад',
      callback_data: `${identifier}_page_${page - 1}_${entity}`
    });
  }
  if ((page + 1) * ITEMS_PER_PAGE < totalItems) {
    buttons.push({
      text: 'Вперед ➡️',
      callback_data: `${identifier}_page_${page + 1}_${entity}`
    });
  }
  return buttons;
}

function findModel(bot, chatId, state, brand, page = 0) {
  try {
    const {
      selectedCarCategory,
      selectedFresh
    } = state || {};
    const table = brand;
    const query = `SELECT * FROM ${table} WHERE category = ? AND fresh = ? ORDER BY id DESC`;
    const resultWrapper = sqlite.run(query, [selectedCarCategory, selectedFresh]);
    const allResults = Array.isArray(resultWrapper) ? resultWrapper : resultWrapper.data || [];
    const results = paginateResults(allResults, page);

    if (!results || results.length === 0) {
      return bot.sendMessage(chatId, '🚫 Ничего не найдено по вашему запросу.');
    }

    results.forEach(async (item, index) => {
      const caption = `🛠 <b>${item.name}</b>\n📦 Состояние: ${item.fresh === 1 ? 'Новое' : 'Б/у'}\n💬 ${item.description}`;
      const options = {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: '💬 Написать продавцу',
              url: `https://t.me/${item.seller_username}`
            }]
          ]
        }
      };

      await delay(index * 300);
      if (item.image && item.image.startsWith('http')) {
        bot.sendPhoto(chatId, item.image, {
          ...options,
          caption
        });
      } else {
        bot.sendMessage(chatId, caption, options);
      }
    });

    const pagination = buildPaginationButtons(brand, page, allResults.length, 'brand');
    if (pagination.length > 0) {
      bot.sendMessage(chatId, '📄 Навигация:', {
        reply_markup: {
          inline_keyboard: [pagination]
        }
      });
    }
  } catch (error) {
    console.error('Ошибка при поиске модели:', error);
    bot.sendMessage(chatId, '❌ Ошибка при выполнении запроса. Попробуйте позже.');
  }
}

function findLawyers(bot, chatId, serviceName, page = 0) {
  try {
    const query = `SELECT * FROM lawyer WHERE service = ? ORDER BY id DESC`;
    const resultWrapper = sqlite.run(query, [serviceName]);
    const allResults = Array.isArray(resultWrapper) ? resultWrapper : resultWrapper.data || [];
    const results = paginateResults(allResults, page);

    if (!results || results.length === 0) {
      return bot.sendMessage(chatId, '🚫 Юристов по данной услуге не найдено.');
    }

    results.forEach(async (item, index) => {
      const caption = `⚖ <b>${item.name}</b>\n📞 Тел: ${item.phone || ''}\n💬 ${item.description || ''}`;
      const options = {
        parse_mode: 'HTML'
      };

      await delay(index * 300);
      if (item.image && item.image.startsWith('http')) {
        bot.sendPhoto(chatId, item.image, {
          ...options,
          caption
        });
      } else {
        bot.sendMessage(chatId, caption, options);
      }
    });

    const pagination = buildPaginationButtons(serviceName.replace(/ /g, '_'), page, allResults.length, 'lawyer');
    if (pagination.length > 0) {
      bot.sendMessage(chatId, '📄 Навигация:', {
        reply_markup: {
          inline_keyboard: [pagination]
        }
      });
    }
  } catch (error) {
    console.error('Ошибка при получении юристов:', error);
    bot.sendMessage(chatId, '❌ Ошибка при получении юристов.');
  }
}

function findProductByType(bot, chatId, type, page = 0) {
  try {
    const query = `SELECT * FROM products WHERE type = ? ORDER BY id DESC`;
    const resultWrapper = sqlite.run(query, [type]);
    const allResults = Array.isArray(resultWrapper) ? resultWrapper : resultWrapper.data || [];
    const results = paginateResults(allResults, page);

    if (!results || results.length === 0) {
      return bot.sendMessage(chatId, '🚫 Продуктов данного типа не найдено.');
    }

    results.forEach(async (item, index) => {
      const caption = `🛞 <b>${item.name}</b>\n💰 Цена: ${item.price || 'Не указана'}\n📞 Тел: ${item.phone || ''}\n💬 ${item.description || ''}`;
      const options = {
        parse_mode: 'HTML'
      };

      await delay(index * 300);
      if (item.image && item.image.startsWith('http')) {
        bot.sendPhoto(chatId, item.image, {
          ...options,
          caption
        });
      } else {
        bot.sendMessage(chatId, caption, options);
      }
    });

    const pagination = buildPaginationButtons(type.replace(/ /g, '_'), page, allResults.length, 'product');
    if (pagination.length > 0) {
      bot.sendMessage(chatId, '📄 Навигация:', {
        reply_markup: {
          inline_keyboard: [pagination]
        }
      });
    }
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    bot.sendMessage(chatId, '❌ Ошибка при загрузке списка товаров.');
  }
}

function findService(bot, chatId, region, page = 0) {
  try {
    const query = `SELECT * FROM service WHERE region = ? ORDER BY id DESC`;
    const resultWrapper = sqlite.run(query, [region]);
    const allResults = Array.isArray(resultWrapper) ? resultWrapper : resultWrapper.data || [];
    const results = paginateResults(allResults, page);

    if (!results || results.length === 0) {
      return bot.sendMessage(chatId, '🚫 Сервисов в этом регионе не найдено.');
    }

    results.forEach(async (item, index) => {
      const caption = `🏙 <b>${item.name}</b>\n📍 Адрес: ${item.address}\n📞 Тел: ${item.phone}\n💬 ${item.description || ''}`;
      const options = {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: '📍 Открыть на карте',
              url: item.map_url || `https://yandex.ru/maps/?text=${encodeURIComponent(item.address)}`
            }]
          ]
        }
      };

      await delay(index * 300);
      if (item.image && item.image.startsWith('http')) {
        bot.sendPhoto(chatId, item.image, {
          ...options,
          caption
        });
      } else {
        bot.sendMessage(chatId, caption, options);
      }
    });

    const pagination = buildPaginationButtons(region, page, allResults.length, 'service');
    if (pagination.length > 0) {
      bot.sendMessage(chatId, '📄 Навигация:', {
        reply_markup: {
          inline_keyboard: [pagination]
        }
      });
    }
  } catch (error) {
    console.error('Ошибка при получении сервисов:', error);
    bot.sendMessage(chatId, '❌ Ошибка при получении сервисов.');
  }
}

module.exports = {
  findModel,
  findLawyers,
  findProductByType,
  findService
};