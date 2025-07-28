// utils/menus.js

const {
  allowedTables,
  CARS_PER_PAGE,
  allowedServices,
  SERVICES_PER_PAGE,
  allowedLawyers,
  LAWYERS_PER_PAGE
} = require('../core/constants');
const {
  buildPaginationButtons
} = require('./pagination');


function showCategoryKeyboard(bot, chatId) {
  const categoryKeyboard = {
    inline_keyboard: [
      [{
        text: 'Для мототехники',
        callback_data: 'category_1'
      }, {
        text: 'Для легковых авто',
        callback_data: 'category_0'
      }],
      [{
        text: 'Грузовой и коммерческий транспорт',
        callback_data: 'category_3'
      }, {
        text: 'Для спецтехники',
        callback_data: 'category_4'
      }]
    ]
  };

  bot.sendMessage(chatId, '🚘 Выберите категорию:', {
    reply_markup: categoryKeyboard
  });
}

function showPartsFresh(bot, chatId) {
  const keyboard = {
    inline_keyboard: [
      [{
        text: "Новые",
        callback_data: "fresh_1"
      }, {
        text: "Контрактные",
        callback_data: "fresh_2"
      }],
      [{
        text: "Б/У",
        callback_data: "fresh_3",

      }, {
        text: "Авторазбор",
        callback_data: "fresh_4"
      }]
    ]
  };

  bot.sendMessage(chatId, '♻️ Выберите состояние запчасти:', {
    reply_markup: keyboard
  });
}

function showBrandsPage(bot, chatId, page = 0) {
  const totalPages = Math.ceil(allowedTables.length / CARS_PER_PAGE);
  const brands = allowedTables.slice(page * CARS_PER_PAGE, (page + 1) * CARS_PER_PAGE);

  const inline_keyboard = [];
  while (brands.length) {
    inline_keyboard.push(brands.splice(0, 3).map(brand => ({
      text: brand,
      callback_data: `brand_${brand}`
    })));
  }


  const pagination = buildPaginationButtons('brand', page, allowedTables.length, 'page', CARS_PER_PAGE);
  if (pagination.length) inline_keyboard.push(pagination);
  inline_keyboard.push([{
    text: '🔙 Главное меню',
    callback_data: 'main_menu'
  }]);

  bot.sendMessage(chatId, `🚗 Выберите бренд (стр. ${page + 1}/${totalPages}):`, {
    reply_markup: {
      inline_keyboard
    }
  });
}

function showServicesPage(bot, chatId, page = 0) {
  const totalPages = Math.ceil(allowedServices.length / SERVICES_PER_PAGE);
  const services = allowedServices.slice(page * SERVICES_PER_PAGE, (page + 1) * SERVICES_PER_PAGE);

  const inline_keyboard = [];
  while (services.length) {
    inline_keyboard.push(services.splice(0, 2).map(service => ({
      text: service.replace(/_/g, ' '),
      callback_data: `service_${service}`
    })));
  }


  const pagination = buildPaginationButtons('service', page, allowedServices.length, 'servicepage', SERVICES_PER_PAGE);
  if (pagination.length) inline_keyboard.push(pagination);
  inline_keyboard.push([{
    text: '🔙 Главное меню',
    callback_data: 'main_menu'
  }]);

  bot.sendMessage(chatId, `🔧 Выберите тип сервиса (стр. ${page + 1}/${totalPages}):`, {
    reply_markup: {
      inline_keyboard
    }
  });
}

function showLawyersPage(bot, chatId, page = 0) {
  const totalPages = Math.ceil(allowedLawyers.length / LAWYERS_PER_PAGE);
  const lawyers = allowedLawyers.slice(page * LAWYERS_PER_PAGE, (page + 1) * LAWYERS_PER_PAGE);

  const inline_keyboard = [];
  while (lawyers.length) {
    inline_keyboard.push(lawyers.splice(0, 2).map(lawyer => ({
      text: lawyer.replace(/_/g, ' '),
      callback_data: `lawyer_${lawyer}`
    })));
  }


  const pagination = buildPaginationButtons('lawyer', page, allowedLawyers.length, 'lawyerpage', LAWYERS_PER_PAGE);
  if (pagination.length) inline_keyboard.push(pagination);
  inline_keyboard.push([{
    text: '🔙 Главное меню',
    callback_data: 'main_menu'
  }]);

  bot.sendMessage(chatId, `⚖️ Выберите юр. услугу (страница ${page + 1}/${totalPages}):`, {
    reply_markup: {
      inline_keyboard
    }
  });
}

function showServiceRegionKeyboard(bot, chatId) {
  const serviceRegionKeyboard = {
    inline_keyboard: [
      [{
        text: 'Центр',
        callback_data: 'serviceregion_1'
      }, {
        text: 'Ильинка',
        callback_data: 'serviceregion_2'
      }],
      [{
        text: 'Запсиб',
        callback_data: 'serviceregion_3'
      }, {
        text: 'Куйбышево',
        callback_data: 'serviceregion_4'
      }],
      [{
        text: 'Кузнецк',
        callback_data: 'serviceregion_5'
      }]
    ]
  };

  bot.sendMessage(chatId, '🏙️ Выберите регион сервиса:', {
    reply_markup: serviceRegionKeyboard
  });
}

function showSellType(bot, chatId) {
  const sellTypeKeyboard = {
    inline_keyboard: [
      [{
        text: 'Легковые',
        callback_data: 'sell_type_Легковые'
      }, {
        text: 'Грузовые/спецтехника',
        callback_data: 'sell_type_Грузовые/спецтехника'
      }]
    ]
  };

  bot.sendMessage(chatId, '🚘 Выберите вид ТС:', {
    reply_markup: sellTypeKeyboard
  });
}

function showHowSell(bot, chatId) {
  const sellHowKeyboard = {
    inline_keyboard: [
      [{
        text: "Продать (выкуп)",
        callback_data: "sell_how_Продать(выкуп)"
      }, {
        text: "Автоломбард",
        callback_data: "sell_how_Автоламбард"
      }, {
        text: "Купить",
        callback_data: "sell_how_Купить"
      }],
    ]
  };

  bot.sendMessage(chatId, "🚘 Выберите способ покупки/продажи:", {
    reply_markup: sellHowKeyboard
  });
}

function showProductsType(bot, chatId) {
  const productsTypeKeyboard = {
    inline_keyboard: [
      [{
        text: 'Аксессуры',
        callback_data: 'products_type_Аксессуры'
      }, {
        text: 'Шины',
        callback_data: 'products_type_Шины'
      }, {
        text: 'Диски',
        callback_data: 'products_type_Диски'
      }, {
        text: 'Комплекты',
        callback_data: 'products_type_Комплекты'
      }, {
        text: 'Услуги/шиномонтаж',
        callback_data: 'products_type_Шиномонтаж'
      }],
    ]
  };

  bot.sendMessage(chatId, '🚘 Выберите необходимую категорию:', {
    reply_markup: productsTypeKeyboard
  });
}

module.exports = {
  showCategoryKeyboard,
  showServiceRegionKeyboard,
  showLawyersPage,
  showSellType,
  showProductsType,
  showPartsFresh,
  showBrandsPage,
  showServicesPage,
  showHowSell
};