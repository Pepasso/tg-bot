// handlers/callbackHandler.js

const {
  sendMainMenu
} = require('../utils/ui');
const {
  showCategoryKeyboard,
  showServiceRegionKeyboard,
  showLawyersPage,
  showSellType,
  showProductsType,
  showPartsFresh
} = require('../utils/menus');
const {
  findModel,
  findService,
  findSellCars,
  findLawyers,
  findProductByType,
  showBrandsPage
} = require('../services/searchService');

function registerCallbackHandler(bot, state) {
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('brand_page_')) {
      const [_, pageStr] = data.split('_');
      const page = parseInt(pageStr, 10);
      const userState = state[chatId];
      if (!userState || userState.selectedCarCategory === undefined || userState.selectedFresh === undefined) {
        return bot.sendMessage(chatId, '⚠️ Пожалуйста, выберите категорию и состояние заново.');
      }
      return showBrandsPage(bot, chatId, page);
    }

    if (data.startsWith('lawyer_page_')) {
      const [_, pageStr, ...serviceParts] = data.split('_');
      const page = parseInt(pageStr, 10);
      const serviceName = serviceParts.join('_').replace(/_/g, ' ');
      return findLawyers(bot, chatId, serviceName, page);
    }

    if (data.startsWith('product_page_')) {
      const [_, pageStr, ...typeParts] = data.split('_');
      const page = parseInt(pageStr, 10);
      const type = typeParts.join('_').replace(/_/g, ' ');
      return findProductByType(bot, chatId, type, page);
    }

    if (data.startsWith('service_page_')) {
      const [_, pageStr, regionStr] = data.split('_');
      const page = parseInt(pageStr, 10);
      const region = parseInt(regionStr);
      return findService(bot, chatId, region, page);
    }

    if (data === 'find_command') {
      state[chatId] = {
        currentPage: 0
      };
      bot.deleteMessage(chatId, query.message.message_id);
      return showCategoryKeyboard(bot, chatId);
    }

    if (data.startsWith('category_')) {
      const category = parseInt(data.split('_')[1]);
      state[chatId] = state[chatId] || {};
      state[chatId].selectedCarCategory = category;
      bot.deleteMessage(chatId, query.message.message_id);
      return showPartsFresh(bot, chatId);
    }

    if (data.startsWith('fresh_')) {
      const fresh = parseInt(data.split('_')[1]);
      state[chatId] = state[chatId] || {};
      state[chatId].selectedFresh = fresh;
      state[chatId].currentPage = 0;
      bot.deleteMessage(chatId, query.message.message_id);
      return showBrandsPage(bot, chatId, 0);
    }

    if (data.startsWith('brand_')) {
      const brand = data.split('_')[1];
      state[chatId] = state[chatId] || {};
      state[chatId].selectedBrand = brand;
      bot.deleteMessage(chatId, query.message.message_id);
      return findModel(bot, chatId, state[chatId], brand);
    }

    if (data.startsWith('serviceregion_')) {
      const region = parseInt(data.split('_')[1]);
      bot.deleteMessage(chatId, query.message.message_id);
      return findService(bot, chatId, region);
    }

    if (data.startsWith('sellType_')) {
      const type = decodeURIComponent(data.split('_')[1]);
      state[chatId] = state[chatId] || {};
      state[chatId].selectedSellType = type;
      bot.deleteMessage(chatId, query.message.message_id);
      return findSellCars(bot, chatId, type);
    }

    if (data.startsWith('lawyer_')) {
      const serviceName = data.replace('lawyer_', '').replace(/_/g, ' ');
      bot.deleteMessage(chatId, query.message.message_id);
      return findLawyers(bot, chatId, serviceName);
    }

    if (data.startsWith('productsType_')) {
      const type = data.replace('productsType_', '');
      bot.deleteMessage(chatId, query.message.message_id);
      return findProductByType(bot, chatId, type);
    }

    switch (data) {
      case 'command_service':
        state[chatId] = state[chatId] || {};
        state[chatId].currentServicePage = 0;
        bot.deleteMessage(chatId, query.message.message_id);
        return showServiceRegionKeyboard(bot, chatId);

      case 'command_lawyer':
        state[chatId] = state[chatId] || {};
        state[chatId].currentLawyersPage = 0;
        bot.deleteMessage(chatId, query.message.message_id);
        return showLawyersPage(bot, chatId, 0);

      case 'sell_command':
        bot.deleteMessage(chatId, query.message.message_id);
        return showSellType(bot, chatId);

      case 'products_command':
        bot.deleteMessage(chatId, query.message.message_id);
        return showProductsType(bot, chatId);

      case 'help_command':
        bot.deleteMessage(chatId, query.message.message_id);
        return bot.sendMessage(chatId, '📖 Помощь по боту:\n\nЕсли возникли проблемы — напишите @Gae4kinChaT');

      case 'main_menu':
        bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
        return sendMainMenu(bot, chatId);
    }

    bot.answerCallbackQuery(query.id);
  });
}

module.exports = {
  registerCallbackHandler
};