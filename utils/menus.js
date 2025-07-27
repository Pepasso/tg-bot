// utils/menus.js

const {
  allowedTables,
  CARS_PER_PAGE
} = require('../core/constants');

function showCategoryKeyboard(bot, chatId) {
  const categoryKeyboard = {
    inline_keyboard: [
      [{
          text: 'Для мототехники',
          callback_data: 'category_1'
        },
        {
          text: 'Для легковых авто',
          callback_data: 'category_0'
        }
      ],
      [{
          text: 'Грузовой и коммерческий транспорт',
          callback_data: 'category_3'
        },
        {
          text: 'Для спецтехники',
          callback_data: 'category_4'
        }
      ]
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
          text: 'Новые',
          callback_data: 'fresh_1'
        },
        {
          text: 'Б/у',
          callback_data: 'fresh_0'
        }
      ]
    ]
  };

  bot.sendMessage(chatId, '♻️ Выберите состояние запчасти:', {
    reply_markup: keyboard
  });
}

function showBrandsPage(bot, chatId, page = 0) {
  const totalPages = Math.ceil(allowedTables.length / CARS_PER_PAGE);
  const brands = allowedTables.slice(page * CARS_PER_PAGE, (page + 1) * CARS_PER_PAGE);

  const inline_keyboard = brands.map((brand) => [{
    text: brand,
    callback_data: `brand_${brand}`
  }]);

  const navigation = [];
  if (page > 0) {
    navigation.push({
      text: '◀️ Назад',
      callback_data: `brand_page_${page - 1}`
    });
  }
  if (page < totalPages - 1) {
    navigation.push({
      text: 'Вперёд ▶️',
      callback_data: `brand_page_${page + 1}`
    });
  }
  if (navigation.length) inline_keyboard.push(navigation);
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

function showServiceRegionKeyboard(bot, chatId) {
  const serviceRegionKeyboard = {
    inline_keyboard: [
      [{
          text: 'Центр',
          callback_data: 'serviceregion_1'
        },
        {
          text: 'Ильинка',
          callback_data: 'serviceregion_2'
        }
      ],
      [{
          text: 'Запсиб',
          callback_data: 'serviceregion_3'
        },
        {
          text: 'Куйбышево',
          callback_data: 'serviceregion_4'
        }
      ],
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
          callback_data: 'sellType_Легковые'
        },
        {
          text: 'Грузовые/спецтехника',
          callback_data: 'sellType_Грузовые/спецтехника'
        }
      ]
    ]
  };

  bot.sendMessage(chatId, '🚘 Выберите вид ТС:', {
    reply_markup: sellTypeKeyboard
  });
}

function showProductsType(bot, chatId) {
  const productsTypeKeyboard = {
    inline_keyboard: [
      [{
          text: 'Аксессуры',
          callback_data: 'productsType_Аксессуры'
        },
        {
          text: 'Шины',
          callback_data: 'productsType_Шины'
        },
        {
          text: 'Диски',
          callback_data: 'productsType_Диски'
        },
        {
          text: 'Комплекты',
          callback_data: 'productsType_Комплекты'
        },
        {
          text: 'Услуги/шиномонтаж',
          callback_data: 'productsType_Шиномонтаж'
        }
      ]
    ]
  };

  bot.sendMessage(chatId, '🚘 Выберите необходимую категорию:', {
    reply_markup: productsTypeKeyboard
  });
}

function showLawyersPage(bot, chatId, page) {
  const lawyers = [
    'независимая_экспертиза', 'оценка_автомобиля', 'автоюрист', 'осаго', 'авайриные_комиссары'
  ];

  const ITEMS_PER_PAGE = 10;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentLawyers = lawyers.slice(start, end);

  const keyboardRows = [];
  while (currentLawyers.length) {
    keyboardRows.push(currentLawyers.splice(0, 2));
  }

  const paginationButtons = [];
  if (page > 0) {
    paginationButtons.push({
      text: '◀️ Назад',
      callback_data: `lawyer_page_${page - 1}`
    });
  }
  if (end < lawyers.length) {
    paginationButtons.push({
      text: 'Вперед ▶️',
      callback_data: `lawyer_page_${page + 1}`
    });
  }

  const keyboard = {
    inline_keyboard: [
      ...keyboardRows.map(row => row.map(lawyer => ({
        text: lawyer.replace(/_/g, ' '),
        callback_data: `lawyer_${lawyer}`
      }))),
      paginationButtons,
      [{
        text: '🔙 Главное меню',
        callback_data: 'main_menu'
      }]
    ]
  };

  bot.sendMessage(chatId, `⚖️ Выберите юр. услугу (страница ${page + 1}):`, {
    reply_markup: keyboard
  });
}

module.exports = {
  showCategoryKeyboard,
  showServiceRegionKeyboard,
  showLawyersPage,
  showSellType,
  showProductsType,
  showPartsFresh,
  showBrandsPage
};