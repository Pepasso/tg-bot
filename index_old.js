const TelegramBot = require('node-telegram-bot-api');
const sqlite = require('sqlite-sync');
const config = require('./config.json');
const cron = require('node-cron');
//import('.add-db.js');
//import('.add-numbers.js');
//Connecting - if the file does not exist it will be created

sqlite.connect(config.db);

// replace the value below with the Telegram token you receive from @BotFather
const token = config.token;
const admin = config.admin;
const allowedTables = [
  'Acura',
  'AlfaRomeo',
  'AstonMartin',
  'Audi',
  'Bentley',
  'BMW',
  'Bugatti',
  'Buick',
  'Cadillac',
  'Canoo',
  'Chevrolet',
  'Chrysler',
  'DeLorean',
  'Dodge',
  'Ferrari',
  'Fiat',
  'Fisker',
  'Ford',
  'Genesis',
  'GMC',
  'Honda',
  'Hummer',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Karma',
  'Kia',
  'Lamborghini',
  'LandRover',
  'Lexus',
  'Lincoln',
  'Lotus',
  'Maserati',
  'Maybach',
  'Mazda',
  'McLaren',
  'Mercedes',
  'Mercury',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Oldsmobile',
  'Polestar',
  'Pontiac',
  'Porsche',
  'Plymouth',
  'Ram',
  'Rivian',
  'RollsRoyce',
  'Saab',
  'Saturn',
  'Scion',
  'Smart',
  'Subaru',
  'Suzuki',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'VinFast',
  'Volvo',
  'Vaz',
  'Volga',
  'Gaz',
  'Gazel',
  'Uaz'
]; // Список разрешенных имен таблиц


const allowedServices = [
  'шиномонтаж',
  'техническое_обслуживание',
  'автозвук',
  'чип_тюнинг',
  'ремонт_подвески',
  'ремонт_генератора',
  'кузовной_ремонт',
  'ремонт_КПП',
  'диагностика',
  'эвакуатор',
  'ремонт_дисков'
];

const allowedLawyers = [
  'независимая_экспертиза',
  'оценка_автомобиля',
  'автоюрист',
  'осаго',
  'авайриные_комиссары'
];

// Добавляем переменные для пагинации
const CARS_PER_PAGE = 10; // Количество машин на странице
let currentPage = 0;
// Добавляем константы для пагинации сервисов
const SERVICES_PER_PAGE = 10; // Количество сервисов на странице
let currentServicePage = 0;
// Добавляем константы для пагинации юристов
const LAWYERS_PER_PAGE = 10; // Количество юристов на странице
let currentLawyersPage = 0;
let selectedCarCategory = null;
let selectedFresh = null;
let sellTCType = '';
let productType = '';
let sellHow = '';
let serviceTypeOrg = null;
let serviceRegion = null;
let lawyerRegion = null;


const bot = new TelegramBot(token, {
  polling: true,
  filepath: false
});

// Выносим логику стартового сообщения в отдельную функцию
function sendMainMenu(chatId, messageIdToDelete = null) {
  // Удаляем предыдущее сообщение если нужно
  if (messageIdToDelete) {
    bot.deleteMessage(chatId, messageIdToDelete).catch(error => {
      console.log('Не удалось удалить сообщение:', error.message);
    });
  }

  const keyboard = {
    inline_keyboard: [
      [{
        text: "🔍 Найти запчасти",
        callback_data: "find_command"
      }],
      [{
        text: "🔧 Выбрать сервис",
        callback_data: "command_service"
      }],
      [{
        text: "⚖️ Выбрать юр.услугу",
        callback_data: "command_lawyer"
      }],
      [{
        text: "💸🚙 Продать/купить авто",
        callback_data: "sell_command"
      }],
      [{
        text: "🛞 Шины/диски",
        callback_data: "products_command"
      }],
      [{
        text: "🔗 Гаечкин Новокузнецк",
        url: "https://t.me/Gae4kinNVKZ" // Ссылка на Telegram-группу
      }],
      [{
        text: "❓ Помощь",
        callback_data: "help_command"
      }],
      /* [{ text: "ℹ️ Информация", callback_data: "info_command" }] */
    ]
  };

  bot.sendMessage(chatId, '🚗 Добро пожаловать в ГаечкинBot! Выберите действие:', {
    reply_markup: keyboard
  });
}

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id;
  const userName = msg.from.username || 'unknown';
  const command = '/start';

  if (!userId) {
    console.error('Ошибка: user_id не определен');
    return;
  }

  sqlite.run(
    'INSERT INTO command_logs (user_id, username, command) VALUES (?, ?, ?)',
    [userId, userName, command],
    function (err) {
      if (err) {
        console.error('Ошибка записи:', err);
      } else {
        console.log('Запись добавлена, ID:', this.lastID);
      }
      sendMainMenu(msg.chat.id);
    }
  );
});

// Задача выполняется каждый день в 23:59
// cron.schedule('* * * * *', () => {
//   const today = new Date().toISOString().slice(0, 10); // Текущая дата (YYYY-MM-DD)

//   sqlite.run(`
//     SELECT COUNT(*) as count 
//     FROM command_logs 
//     WHERE command = '/start' 
//       AND DATE(timestamp) = DATE(?)
//   `, [today], (err, row) => {

//     console.log(row)

//     const message = `📊 Статистика за ${today}:\n` +
//       `Команда /start запущена ${row.count} раз.`;

//     // Отправка администратору
//     bot.sendMessage(config.admin, message)
//       .catch(err => console.error('Ошибка отправки:', err));
//   });
// });

// Обработчик нажатий на кнопки
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const command = query.data;

  switch (command) {
    case 'find_command':
      bot.deleteMessage(chatId, query.message.message_id);
      currentPage = 0; // Сброс пагинации
      showCategoryKeyboard(chatId);
      // showBrandsPage(chatId, 0);
      break;

    case 'command_service':
      bot.deleteMessage(chatId, query.message.message_id);
      // showSerivceTypeKeyboard(chatId)
      showSerivceRegionKeyboard(chatId);
      break;

    case 'command_lawyer':
      bot.deleteMessage(chatId, query.message.message_id);
      currentLawyerPage = 0; // Сброс пагинации
      showLawyersPage(chatId, 0);
      break;
    case 'sell_command':
      bot.deleteMessage(chatId, query.message.message_id);
      showSellType(chatId);
      break;
    case 'products_command':
      bot.deleteMessage(chatId, query.message.message_id);
      showProductsType(chatId);
      break;
    case 'help_command':
      bot.deleteMessage(chatId, query.message.message_id);
      // Показываем справку
      bot.sendMessage(chatId, '📖 Помощь по боту:\n\n Если возникли проблемы - напишите @Gae4kinChaT');
      break;
      /* 
          case 'info_command':
            // Показываем информацию
            bot.sendMessage(chatId, 'ℹ️ Этот бот помогает найти автозапчасти. Версия 1.0\nРазработчик: @yourchannel');
            break; */
  }

  // Подтверждаем получение callback
  bot.answerCallbackQuery(query.id);
});

// Обработчик выбора марки
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // Обработка пагинации
  if (data.startsWith('page_')) {
    const page = parseInt(data.split('_')[1]);
    currentPage = page;
    bot.deleteMessage(chatId, query.message.message_id);
    showBrandsPage(chatId, page);
  }

  // Обработка пагинации сервисов
  if (data.startsWith('service_page_')) {
    const page = parseInt(data.split('_')[2]);
    currentServicePage = page;
    bot.deleteMessage(chatId, query.message.message_id);
    showServicesPage(chatId, page);
  }

  // Обработка пагинации юристов
  if (data.startsWith('lawyer_page_')) {
    const page = parseInt(data.split('_')[2]);
    currentLawyerPage = page;
    bot.deleteMessage(chatId, query.message.message_id);
    showLawyersPage(chatId, page);
  }

  if (data.startsWith('brand_')) {
    const brand = data.split('_')[1];
    try {
      // Первый запрос: Ищем записи с isPayd = 1
      const paidResults = findModel(brand, selectedCarCategory, selectedFresh, true); // Добавляем флаг для isPayd
      const sortedPaidResults = paidResults.sort((a, b) => a.paydValue - b.paydValue); // Сортировка по paydValue

      // Второй запрос: Ищем остальные записи
      const otherResults = findModel(brand, selectedCarCategory, selectedFresh, false); // Добавляем флаг для isPayd

      let otherPartsList = ''; // Для хранения обычных записей

      // Формируем сообщения для записей с isPayd = 1
      if (sortedPaidResults && sortedPaidResults.length > 0) {
        for (const part of sortedPaidResults) {
          const phones = part.key.split(', ')
            .map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`)
            .join(', ');

          // Создаем текстовое сообщение для клиента
          const clientMessageText = `
🔧 ${part.name}
📍 Адрес: ${part.address}
📞 Телефоны: ${phones}

ℹ️ Сообщение продавцу успешно отправлено! Вы можете начать чат, нажав на кнопку ниже.
`;

          // Проверяем наличие chatUsername
          if (part.chatUsername && part.chatUsername.trim() !== '') {
            // Получаем tgId продавца
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
                  inline_keyboard: [
                    [{
                      text: "Начать чат",
                      url: chatUrl
                    }],
                    [{
                      text: "Назад к выбору марки",
                      callback_data: "find_command"
                    }],
                    [{
                      text: "🔙 Главное меню",
                      callback_data: "main_menu"
                    }]
                  ]
                };

                // Отправляем изображение (если оно есть) вместе с текстом
                if (part.image && part.image.startsWith('./')) {
                  bot.sendPhoto(chatId, require('fs').createReadStream(part.image), {
                    caption: clientMessageText,
                    parse_mode: 'HTML',
                    reply_markup: chatKeyboard
                  });
                } else {
                  // Если изображения нет, отправляем только текст
                  bot.sendMessage(chatId, clientMessageText, {
                    parse_mode: 'HTML',
                    reply_markup: chatKeyboard
                  });
                }
              } else {
                // Если сообщение не отправлено, уведомляем клиента
                bot.sendMessage(chatId, '❌ Не удалось отправить сообщение продавцу. Возможно, он заблокировал бота или не начал с ним диалог.');
              }
            } else {
              // Если не удалось получить tgId, показываем только кнопку "Назад"
              const chatKeyboard = {
                inline_keyboard: [
                  [{
                    text: "Назад к выбору марки",
                    callback_data: "find_command"
                  }],
                  [{
                    text: "🔙 Главное меню",
                    callback_data: "main_menu"
                  }]
                ]
              };

              bot.sendMessage(chatId, '❌ Чат с продавцом недоступен.', {
                reply_markup: chatKeyboard
              });
            }
          } else {
            // Если chatUsername отсутствует, показываем только кнопку "Назад"
            const chatKeyboard = {
              inline_keyboard: [
                [{
                  text: "Назад к выбору марки",
                  callback_data: "find_command"
                }],
                [{
                  text: "🔙 Главное меню",
                  callback_data: "main_menu"
                }]
              ]
            };

            bot.sendMessage(chatId, 'Чат недоступен.', {
              reply_markup: chatKeyboard
            });
          }
        }
      }

      // Формируем список для остальных записей
      if (otherResults && otherResults.length > 0) {
        otherPartsList = otherResults.map(part => {
          const phones = part.key.split(', ')
            .map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`)
            .join(', ');
          return `🔧 ${part.name}\n📍 Адрес: ${part.address}\n📞 Телефоны: ${phones}`;
        }).join('\n\n');
      }

      // Если есть обычные записи, отправляем их в одном сообщении
      if (otherPartsList) {
        bot.sendMessage(chatId, `✅ Найдены запчасти для ${brand}:\n\n${otherPartsList}`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Назад к выбору марки",
                callback_data: "find_command"
              }],
              [{
                text: "🔙 Главное меню",
                callback_data: "main_menu"
              }]
            ]
          }
        });
      } else if (!sortedPaidResults || (sortedPaidResults.length === 0 && !otherPartsList)) {
        // Если ничего не найдено
        bot.sendMessage(chatId, `😞 По вашему запросу "${brand}" ничего не найдено`, {
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Попробовать снова",
                callback_data: "find_command"
              }]
            ]
          }
        });
      }
    } catch (error) {
      console.error('Database error:', error);
      bot.sendMessage(chatId, '⚠️ Произошла ошибка при поиске. Попробуйте позже.');
    }
  }

  if (data.startsWith('service_')) {
    const serviceKey = data.replace(/^service_/, '')
      .replace(/_/g, '')
      .replace(/([а-яёa-z])([А-ЯЁA-Z])/g, '$1 $2');

    const originalServiceKey = data.replace(/^service_/, '').replace(/_/g, ' ');

    console.log('serviceKey', serviceKey)

    try {
      // Запрос платных сервисов
      const paidResults = await findService(serviceKey, true) || [];
      const sortedPaidResults = Array.isArray(paidResults) ?
        paidResults.sort((a, b) => a.paydValue - b.paydValue) : [];

      // Запрос бесплатных сервисов
      const otherResults = await findService(serviceKey, false) || [];

      let otherServicesList = '';
      // Обработка платных сервисов
      if (sortedPaidResults.length > 0) {
        for (const service of sortedPaidResults) {
          const phones = service.key.split(', ')
            .map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`)
            .join(', ');

          if (service.chatUsername) {
            const clientMessage = `
            🔧 ${service.name}
            📍 Адрес: ${service.address}
            📞 Телефоны: ${phones}
          
            ${service.additional || ''}
          `.replace(/^[ \t]+/gm, '').trim();
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
                  inline_keyboard: [
                    [{
                      text: "Начать чат",
                      url: chatUrl
                    }],
                    [{
                      text: "Назад к сервисам",
                      callback_data: "command_service"
                    }],
                    [{
                      text: "🔙 Главное меню",
                      callback_data: "main_menu"
                    }]
                  ]
                };

                if (service.image) {
                  bot.sendPhoto(chatId, require('fs').createReadStream(service.image), {
                    caption: clientMessage,
                    parse_mode: 'HTML',
                    reply_markup: keyboard
                  });
                } else {
                  bot.sendMessage(chatId, clientMessage, {
                    parse_mode: 'HTML',
                    reply_markup: keyboard
                  });
                }
              } else {
                bot.sendMessage(chatId, '❌ Не удалось отправить сообщение');
              }
            }
          } else {
            const clientMessage = `
            🔧 ${service.name}
            📍 Адрес: ${service.address}
            📞 Телефоны: ${phones}
          
            ${service.additional || ''}
          `.replace(/^[ \t]+/gm, '').trim();
            const keyboard = {
              inline_keyboard: [
                [{
                  text: "Назад к сервисам",
                  callback_data: "command_service"
                }],
                [{
                  text: "🔙 Главное меню",
                  callback_data: "main_menu"
                }]
              ]
            };

            if (service.image) {
              bot.sendPhoto(chatId, require('fs').createReadStream(service.image), {
                caption: clientMessage,
                parse_mode: 'HTML',
                reply_markup: keyboard
              });
            } else {
              bot.sendMessage(chatId, clientMessage, {
                parse_mode: 'HTML',
                reply_markup: keyboard
              });
            }
          }
        }
      }

      // Обработка обычных сервисов
      if (otherResults.length > 0) {
        otherServicesList = otherResults.map(service => {
          const phones = service.key.split(', ')
            .map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`)
            .join(', ');
          return `🔧 ${service.name}\n📍 Адрес: ${service.address}\n📞 Телефоны: ${phones}`;
        }).join('\n\n');
      }

      // Отправка результатов
      if (otherServicesList) {
        if (sortedPaidResults.length) {
          await delay(2000); // Задержка 2 секунды
        }

        await bot.sendMessage(chatId, `✅ Найдены сервисы для ${originalServiceKey}:\n\n${otherServicesList}`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Назад к сервисам",
                callback_data: "command_service"
              }],
              [{
                text: "🔙 Главное меню",
                callback_data: "main_menu"
              }]
            ]
          }
        });
      } else if (!sortedPaidResults.length && !otherResults.length) {
        await bot.sendMessage(chatId, `😞 Ничего не найдено для "${originalServiceKey}"`, {
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Попробовать снова",
                callback_data: "command_service"
              }]
            ]
          }
        });
      }

    } catch (error) {
      console.error('Service error:', error);
      bot.sendMessage(chatId, '⚠️ Произошла ошибка. Попробуйте позже.');
    }
  }

  if (data.startsWith('lawyer_')) {
    const lawyerKey = data.replace(/^lawyer_/, '')
      .replace(/_/g, '')
      .replace(/([а-яёa-z])([А-ЯЁA-Z])/g, '$1 $2');

    const originalLawyerKey = data.replace(/^lawyer_/, '').replace(/_/g, ' ');

    try {
      // Запрос платных юристов
      const paidResults = await findLawyer(lawyerKey, true) || [];
      const sortedPaidResults = Array.isArray(paidResults) ?
        paidResults.sort((a, b) => a.paydValue - b.paydValue) : [];

      // Запрос бесплатных юристов
      const otherResults = await findLawyer(lawyerKey, false) || [];

      let otherLawyersList = '';

      // Обработка платных юристов
      if (sortedPaidResults.length > 0) {
        for (const lawyer of sortedPaidResults) {
          const phones = lawyer.key.split(', ')
            .map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`)
            .join(', ');


          const clientMessage = `
            🔧 ${lawyer.name}
            📍 Адрес: ${lawyer.address}
            📞 Телефоны: ${phones}
            
            ${lawyer.additional}
          `.replace(/^[ \t]+/gm, '').trim();

          if (lawyer.chatUsername) {
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
                  inline_keyboard: [
                    [{
                      text: "Начать чат",
                      url: chatUrl
                    }],
                    [{
                      text: "Назад к юристам",
                      callback_data: "command_lawyer"
                    }],
                    [{
                      text: "🔙 Главное меню",
                      callback_data: "main_menu"
                    }]
                  ]
                };

                if (lawyer.image) {
                  bot.sendPhoto(chatId, require('fs').createReadStream(lawyer.image), {
                    caption: clientMessage,
                    parse_mode: 'HTML',
                    reply_markup: keyboard
                  });
                } else {
                  bot.sendMessage(chatId, clientMessage, {
                    parse_mode: 'HTML',
                    reply_markup: keyboard
                  });
                }
              } else {
                bot.sendMessage(chatId, '❌ Не удалось отправить сообщение');
              }
            }
          } else {

            const clientMessage = `
              🔧 ${lawyer.name}
              📍 Адрес: ${lawyer.address}
              📞 Телефоны: ${phones}
              
              ${lawyer.additional}
            `.replace(/^[ \t]+/gm, '').trim();

            const keyboard = {
              inline_keyboard: [
                [{
                  text: "Назад к сервисам",
                  callback_data: "command_lawyer"
                }],
                [{
                  text: "🔙 Главное меню",
                  callback_data: "main_menu"
                }]
              ]
            };

            if (lawyer.image) {
              bot.sendPhoto(chatId, require('fs').createReadStream(lawyer.image), {
                caption: clientMessage,
                parse_mode: 'HTML',
                reply_markup: keyboard
              });
            } else {
              bot.sendMessage(chatId, clientMessage, {
                parse_mode: 'HTML',
                reply_markup: keyboard
              });
            }
          }
        }
      }

      // Обработка бесплатных юристов с задержкой
      if (otherResults.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Задержка 2с

        otherLawyersList = otherResults.map(lawyer => {
          const phones = lawyer.key.split(', ')
            .map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`)
            .join(', ');

          return `
            🔧 ${lawyer.name}
            📍 Адрес: ${lawyer.address}
            📞 Телефоны: ${phones}
            ${lawyer.additional ? `\n${lawyer.additional}` : ''}
          `.replace(/^[ \t]+/gm, '').trim();
        }).join('\n\n');
      }

      // Отправка результатов
      if (otherLawyersList) {
        await bot.sendMessage(chatId, `✅ Найдены юристы для ${originalLawyerKey}:\n\n${otherLawyersList}`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Назад к юристам",
                callback_data: "command_lawyer"
              }],
              [{
                text: "🔙 Главное меню",
                callback_data: "main_menu"
              }]
            ]
          }
        });
      } else if (!sortedPaidResults.length && !otherResults.length) {
        await bot.sendMessage(chatId, `😞 Ничего не найдено для "${originalLawyerKey}"`, {
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Попробовать снова",
                callback_data: "command_lawyer"
              }]
            ]
          }
        });
      }

    } catch (error) {
      console.error('Lawyer error:', error);
      bot.sendMessage(chatId, '⚠️ Произошла ошибка. Попробуйте позже.');
    }
  }

  if (data.startsWith("category_")) {
    const category = parseInt(data.split("_")[1]); // Извлекаем номер категории (1, 2, 3 или 4)
    selectedCarCategory = category;
    bot.deleteMessage(chatId, query.message.message_id);
    // Показать страницу с Качеством запчастей
    showPartsFresh(chatId);
  }

  if (data.startsWith("fresh_")) {
    const fresh = parseInt(data.split("_")[1]); // Извлекаем номер категории (1, 2, 3 или 4)
    selectedFresh = fresh;
    bot.deleteMessage(chatId, query.message.message_id);
    // Показать страницу с марками автомобилей
    currentPage = 0; // Сброс пагинации
    if (selectedCarCategory === 0) {
      showBrandsPage(chatId, 0);
    }
  }

  // if (data.startsWith("servicetype_")) {
  //   const servicetype = parseInt(data.split("_")[1]); // Извлекаем номер категории (1, 2, 3 или 4)
  //   serviceTypeOrg = servicetype;
  //   bot.deleteMessage(chatId, query.message.message_id);
  //   // Показать страницу с марками автомобилей
  //   showSerivceRegionKeyboard(chatId);
  // }

  if (data.startsWith("serviceregion_")) {
    const serviceregion = parseInt(data.split("_")[1]); // Извлекаем номер категории (1, 2, 3 или 4)
    serviceRegion = serviceregion;
    bot.deleteMessage(chatId, query.message.message_id);
    // Показать страницу с марками автомобилей
    currentServicePage = 0; // Сброс пагинации
    showServicesPage(chatId, 0);
  }

  if (data.startsWith("sellType_")) {
    const sell = data.split("_")[1]; // Извлекаем номер категории (1, 2, 3 или 4)
    sellTCType = sell;
    bot.deleteMessage(chatId, query.message.message_id);
    // Показать страницу с марками автомобилей
    showHowSell(chatId);
  }

  if (data.startsWith("productsType_")) {
    const product = data.split("_")[1]; // Извлекаем номер категории (1, 2, 3 или 4)
    productType = product;
    bot.deleteMessage(chatId, query.message.message_id);
    // Показать страницу с марками автомобилей
    showHowSell(chatId);
  }

  if (data.startsWith("howSell_")) {
    const sell = data.split("_")[1]; // Извлекаем номер категории (1, 2, 3 или 4)
    sellHow = sell;
    bot.deleteMessage(chatId, query.message.message_id);
    // Показать страницу с марками автомобилей
    showSellerInfo(chatId, query);
  }


  if (data === 'main_menu') {
    try {
      // Удаляем предыдущее сообщение с клавиатурой
      await bot.deleteMessage(chatId, query.message.message_id);
    } catch (error) {
      console.log('Ошибка при удалении сообщения:', error.message);
    }

    // Вызываем главное меню
    sendMainMenu(chatId);
  }

  bot.answerCallbackQuery(query.id);
});

// Функция для получения tgId по username
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
    inline_keyboard: [
      [{
          text: "Для мототехники",
          callback_data: "category_1"
        },
        {
          text: "Для легковых авто",
          callback_data: "category_0"
        }
      ],
      [{
          text: "Грузовой и коммерческий транспорт",
          callback_data: "category_3"
        },
        {
          text: "Для спецтехники",
          callback_data: "category_4"
        }
      ]
    ]
  };

  bot.sendMessage(chatId, "🚘 Выберите категорию:", {
    reply_markup: categoryKeyboard
  });
}

function showPartsFresh(chatId) {
  const categoryKeyboard = {
    inline_keyboard: [
      [{
          text: "Новые",
          callback_data: "fresh_1"
        },
        {
          text: "Контрактные",
          callback_data: "fresh_2"
        }
      ],
      [{
          text: "Б/У",
          callback_data: "fresh_3",

        },
        {
          text: "Авторазбор",
          callback_data: "fresh_4"
        }
      ]
    ]
  };

  bot.sendMessage(chatId, "🚘 Выберите категорию:", {
    reply_markup: categoryKeyboard
  });
}

// function showSerivceTypeKeyboard(chatId) {
//   const serviceTypeKeyboard = {
//     inline_keyboard: [
//       [{
//           text: "Частник",
//           callback_data: "servicetype_0"
//         },
//         {
//           text: "Организация",
//           callback_data: "servicetype_1"
//         }
//       ],
//     ]
//   };

//   bot.sendMessage(chatId, "🚘 Выберите тип сервиса:", {
//     reply_markup: serviceTypeKeyboard
//   });
// }

function showSerivceRegionKeyboard(chatId) {
  const serviceRegionKeyboard = {
    inline_keyboard: [
      [{
          text: "Центр",
          callback_data: "serviceregion_1"
        },
        {
          text: "Ильинка",
          callback_data: "serviceregion_2"
        }
      ],
      [{
          text: "Запсиб",
          callback_data: "serviceregion_3"
        },
        {
          text: "Куйбышево",
          callback_data: "serviceregion_4"
        }
      ],
      [{
        text: "Кузнецк",
        callback_data: "serviceregion_5"
      }],
    ]
  };

  bot.sendMessage(chatId, "🏙️ Выберите регион:", {
    reply_markup: serviceRegionKeyboard
  });
}

function getCategoryName(category) {
  switch (category) {
    case 1:
      return "Для мототехники";
    case 2:
      return "Для легковых авто";
    case 3:
      return "Грузовой и коммерческий транспорт";
    case 4:
      return "Для спецтехники";
    default:
      return "Неизвестная категория";
  }
}

// Функция отображения страницы с марками
function showBrandsPage(chatId, page) {
  const start = page * CARS_PER_PAGE;
  const end = start + CARS_PER_PAGE;
  const currentBrands = allowedTables.slice(start, end);

  const keyboardRows = [];

  // Группируем кнопки по 3 в ряд
  while (currentBrands.length) {
    keyboardRows.push(currentBrands.splice(0, 3));
  }

  const paginationButtons = [];

  // Кнопки пагинации
  if (page > 0) {
    paginationButtons.push({
      text: "◀️ Назад",
      callback_data: `page_${page-1}`
    });
  }
  if (end < allowedTables.length) {
    paginationButtons.push({
      text: "Вперед ▶️",
      callback_data: `page_${page+1}`
    });
  }

  const brandKeyboard = {
    inline_keyboard: [
      ...keyboardRows.map(row => row.map(brand => ({
        text: brand,
        callback_data: `brand_${brand}`
      }))),
      paginationButtons,
      [{
        text: "🔙 Главное меню",
        callback_data: "main_menu"
      }]
    ]
  };

  bot.sendMessage(chatId, `🚘 Выберите марку автомобиля (Страница ${page+1}/${Math.ceil(allowedTables.length/CARS_PER_PAGE)}):`, {
    reply_markup: brandKeyboard
  });
}

// Функция отображения страницы продажи
function showSellType(chatId) {
  const sellTypeKeyboard = {
    inline_keyboard: [
      [{
          text: "Легковые",
          callback_data: "sellType_Легковые"
        },
        {
          text: "Грузовые/спецтехника",
          callback_data: "sellType_Грузовые/спецтехника"
        }
      ],
    ]
  };

  bot.sendMessage(chatId, "🚘 Выберите вид ТС:", {
    reply_markup: sellTypeKeyboard
  });
}

function showProductsType(chatId) {
  const productsTypeKeyboard = {
    inline_keyboard: [
      [{
          text: "Аксессуры",
          callback_data: "productsType_Аксессуры"
        },
        {
          text: "Шины",
          callback_data: "productsType_Шины"
        },
        {
          text: "Диски",
          callback_data: "productsType_Диски"
        },
        {
          text: "Комплекты",
          callback_data: "productsType_Комплекты"
        },
        {
          text: "Услуги/шиномонтаж",
          callback_data: "productsType_Шиномонтаж"
        },
      ],
    ]
  };

  bot.sendMessage(chatId, "🚘 Выберите необходимую категорию:", {
    reply_markup: productsTypeKeyboard
  });
}

function showHowSell(chatId) {
  const sellHowKeyboard = {
    inline_keyboard: [
      [{
          text: "Продать (выкуп)",
          callback_data: "howSell_Продать(выкуп)"
        },
        {
          text: "Автоломбард",
          callback_data: "howSell_Автоламбард"
        },
        {
          text: "Купить",
          callback_data: "howSell_Купить"
        }
      ],
    ]
  };

  bot.sendMessage(chatId, "🚘 Выберите способ покупки/продажи:", {
    reply_markup: sellHowKeyboard
  });
}

function showHowSell(chatId) {
  const sellHowKeyboard = {
    inline_keyboard: [
      [{
          text: "Продать (выкуп)",
          callback_data: "howSell_Продать(выкуп)"
        },
        {
          text: "Автоломбард",
          callback_data: "howSell_Автоламбард"
        },
        {
          text: "Купить",
          callback_data: "howSell_Купить"
        }
      ],
    ]
  };

  bot.sendMessage(chatId, "🚘 Выберите способ покупки/продажи:", {
    reply_markup: sellHowKeyboard
  });
}

async function showSellerInfo(chatId, query) {
  // Подготавливаем сообщение для продавца
  let usernameInfo = '';
  if (query.from.username) {
    usernameInfo = ` (USERNAME: @${query.from.username})`;
  }

  const sellerMessage = `
  🆕 Новый запрос на покупку/продажу авто!
  Вид ТС: ${sellTCType}
  Выбранный способ: ${sellHow}
  Клиент: ${query.from.first_name}${usernameInfo}
  `;

  try {
    // Получаем массив с объектом
    const sellerData = getAndreyChatId(); // Возвращает [ { tgId: 1024842449 } ]

    // Проверяем, что данные продавца получены
    if (!sellerData || sellerData.length === 0) {
      throw new Error('Данные продавца не найдены');
    }

    // Достаем первый элемент массива
    const firstSeller = sellerData[0];

    // Получаем числовой идентификатор
    const sellerTgId = firstSeller.tgId; // 1024842449 (уже число)

    // Отправляем сообщение продавцу
    const isSent = await sendMessageToSeller(sellerTgId, sellerMessage);

    if (isSent) {
      // Создаем клавиатуру с кнопкой "Начать чат"
      const chatUrl = `tg://resolve?domain=${encodeURIComponent(firstSeller.username)}`; // Используем chatUsername, если он есть
      const chatKeyboard = {
        inline_keyboard: [
          [{
            text: "Начать чат",
            url: chatUrl
          }],
          [{
            text: "🔙 Главное меню",
            callback_data: "main_menu"
          }]
        ]
      };

      // Сообщение для клиента
      const clientMessage = `
🚘 Оставте заявку, в течение 10 минут мы с Вами свяжемся для уточнения деталей и приедем на осмотр.
Телефон: <a href="tel:+79134363667">+79134363667</a>.
`;

      // Первое сообщение
      await bot.sendMessage(chatId, clientMessage, {
        parse_mode: 'HTML',
        reply_markup: chatKeyboard
      });

      // 2. Отправляем reply-клавиатуру с контактом
      const contactKeyboard = {
        reply_markup: {
          keyboard: [
            [{
              text: "📱 Поделиться контактом",
              request_contact: true
            }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      };

      // Второе сообщение
      await bot.sendMessage(chatId, "Вы можете поделиться контактом по кнопке ниже!", contactKeyboard);

      // 3. Запускаем обработчик контакта ТОЛЬКО ПОСЛЕ отправки клавиатуры
      const contactHandler = async (msg) => {
        if (msg.contact) {
          // Удаляем обработчик после первого использования
          bot.removeListener('message', contactHandler);

          if (!sellerData.length) throw new Error('Продавец не найден');

          const sellerMessage = `
📱 Новый контакт от клиента:
Имя: ${msg.from.first_name}
Телефон: ${msg.contact.phone_number}
`;

          await sendMessageToSeller(sellerData[0].tgId, sellerMessage);
          await bot.sendMessage(chatId, "✅ Контакт отправлен продавцу!");
        }
      };

      // Регистрируем обработчик
      bot.on('message', contactHandler);
    } else {
      // Если сообщение не отправлено
      bot.sendMessage(chatId, '❌ Не удалось отправить заявку. Попробуйте позже.', {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "Назад",
              callback_data: "sell_command"
            }]
          ]
        }
      });
    }
  } catch (error) {
    console.error('Ошибка:', error);
    bot.sendMessage(chatId, '⚠️ Произошла ошибка. Попробуйте позже.');
  }
}

// Функция отображения страницы сервисов
function showServicesPage(chatId, page) {
  const start = page * SERVICES_PER_PAGE;
  const end = start + SERVICES_PER_PAGE;
  const currentServices = allowedServices.slice(start, end);

  const keyboardRows = [];

  // Группируем кнопки по 2 в ряд
  while (currentServices.length) {
    keyboardRows.push(currentServices.splice(0, 2));
  }

  const paginationButtons = [];

  // Кнопки пагинации
  if (page > 0) {
    paginationButtons.push({
      text: "◀️ Назад",
      callback_data: `service_page_${page-1}`
    });
  }
  if (end < allowedServices.length) {
    paginationButtons.push({
      text: "Вперед ▶️",
      callback_data: `service_page_${page+1}`
    });
  }

  const serviceKeyboard = {
    inline_keyboard: [
      ...keyboardRows.map(row => row.map(service => ({
        text: service.replace(/_/g, ' '),
        callback_data: `service_${service.replace(/\s+/g, '_')}`
      }))),
      paginationButtons,
      [{
        text: "🔙 Главное меню",
        callback_data: "main_menu"
      }]
    ]
  };

  bot.sendMessage(chatId, `🔧 Выберите тип сервиса (Страница ${page+1}/${Math.ceil(allowedServices.length/SERVICES_PER_PAGE)}):`, {
    reply_markup: serviceKeyboard
  });
}

// Функция отображения страницы юр.услуг
function showLawyersPage(chatId, page) {
  const start = page * LAWYERS_PER_PAGE;
  const end = start + LAWYERS_PER_PAGE;
  const currentLawyer = allowedLawyers.slice(start, end);

  const keyboardRows = [];

  // Группируем кнопки по 2 в ряд
  while (currentLawyer.length) {
    keyboardRows.push(currentLawyer.splice(0, 2));
  }

  const paginationButtons = [];

  // Кнопки пагинации
  if (page > 0) {
    paginationButtons.push({
      text: "◀️ Назад",
      callback_data: `lawyer_page_${page-1}`
    });
  }
  if (end < allowedLawyers.length) {
    paginationButtons.push({
      text: "Вперед ▶️",
      callback_data: `lawyer_page_${page+1}`
    });
  }

  const lawyerKeyboard = {
    inline_keyboard: [
      ...keyboardRows.map(row => row.map(lawyer => ({
        text: lawyer.replace(/_/g, ' '),
        callback_data: `lawyer_${lawyer.replace(/\s+/g, '_')}`
      }))),
      paginationButtons,
      [{
        text: "🔙 Главное меню",
        callback_data: "main_menu"
      }]
    ]
  };

  bot.sendMessage(chatId, `⚖️ Выберите юр услугу (Страница ${page+1}/${Math.ceil(allowedLawyers.length/LAWYERS_PER_PAGE)}):`, {
    reply_markup: lawyerKeyboard
  });
}

//const models = ['audi', 'bmw'];
/* let model; // Глобальная переменная для хранения значения model
const addMode = {};
let countStep = 1;

// Retrieve message from database
bot.onText(/\/find ([^;'\"]+)/, (msg, match) => {
  model = null;
  //const key = match[1];
  //const message = getMessage(key);
  //if (message.exists) {
  //bot.forwardMessage(msg.chat.id, message.from_id, message.message_id);
  //}
  const chatId = msg.chat.id;
  const keyFirst = match[1].toLowerCase(); // Сначала преобразуем весь ключ в нижний регистр
  const key = keyFirst.charAt(0).toUpperCase() + keyFirst.slice(1); // Затем делаем первую букву заглавной
  const uniqueKey = key + Date.now(); // Генерация уникального ключа
  console.log(key);
  if (key && uniqueKey) {
    model = findModel(key);
    processCarDetailInput(chatId, msg.text, 2);
  }
});

bot.onText(/\/service ([^;'\"]+)/, (msg, match) => {
  model = null;
  //const key = match[1];
  //const message = getMessage(key);
  //if (message.exists) {
  //bot.forwardMessage(msg.chat.id, message.from_id, message.message_id);
  //}
  const chatId = msg.chat.id;
  const keyFirst = match[1].toLowerCase(); // Сначала преобразуем весь ключ в нижний регистр
  const key = keyFirst.charAt(0).toUpperCase() + keyFirst.slice(1); // Затем делаем первую букву заглавной
  const uniqueKey = key + Date.now(); // Генерация уникального ключа
  console.log(key);
  if (key && uniqueKey) {
    model = getKeyBySynonym(key, chatId, msg.text, 2);
  }
}); */

/* bot.onText(/\/lawyer([^;'\"]+)/, (msg, match) => {
  model = null;
  //const key = match[1];
  //const message = getMessage(key);
  //if (message.exists) {
  //bot.forwardMessage(msg.chat.id, message.from_id, message.message_id);
  //}
  const chatId = msg.chat.id;
  const keyFirst = match[1].toLowerCase(); // Сначала преобразуем весь ключ в нижний регистр
  const key = keyFirst.charAt(0).toUpperCase() + keyFirst.slice(1); // Затем делаем первую букву заглавной
  const uniqueKey = key + Date.now(); // Генерация уникального ключа
  console.log(key);
  if (key && uniqueKey) {
    model = findLawyer(key);
    processCarDetailInput(chatId, msg.text, 2);
  }
});
 */
if (admin) {
  // Add message to database
  bot.onText(/\/add ([^;'\"]+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const key = match[1];
    var text = '';
    if (isMessageExists(key)) {
      text = 'Sorry, message with this key already exists.';
    } else {
      addMode[chatId] = {
        key: key,
        from: msg.from.id
      };
      text = 'Now send me a message that needs to be saved. ' +
        'Or /cancel to abort operation.';
    }
    bot.sendMessage(chatId, text);
  });
}

/* bot.onText(/(.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (!messageText.startsWith('/find')) {
    if (chatId in addMode) {
      if (countStep == 1) {
        processCarDetailInput(chatId, msg.text, 1);
        countStep++;
      } else if (countStep == 2) {
        processCarDetailInput(chatId, msg.text, 2);
        countStep = 1;
      }
    }
  }
}); */

if (admin) {
  // Get list of messages for current user
  bot.onText(/\/list/, (msg) => {
    const chatId = msg.chat.id;
    const fromId = msg.from.id;
    const data = sqlite.run(
      "SELECT `key` FROM messages WHERE `from_id` = ?",
      [fromId]);
    if (data.length == 0) {
      bot.sendMessage(chatId, 'You have not added anything.');
      return;
    }
    var lines = [];
    data.forEach(function (element) {
      lines.push('`' + element.key + '`');
    });
    bot.sendMessage(chatId, lines.join(', '), {
      parse_mode: 'markdown'
    });
  });

  // Remove message from database
  bot.onText(/\/remove ([^;'\"]+)/, (msg, match) => {
    const key = match[1];
    const message = getMessage(key);
    if (!message.exists) return;
    if (message.from_id != msg.from.id) return;

    sqlite.delete('messages', {
      'key': key
    }, function (res) {
      if (!res.error) {
        bot.sendMessage(msg.chat.id, 'Message successfully deleted!');
      }
    });
  });
}

function isMessageExists(key) {
  return sqlite.run(
    "SELECT COUNT(*) as cnt FROM messages WHERE `key` = ?",
    [key])[0].cnt != 0;
}

function getMessage(key) {
  const data = sqlite.run(
    "SELECT * FROM messages WHERE `key` = ? LIMIT 1",
    [key]);
  if (data.length == 0) {
    return {
      exists: false
    };
  }
  data[0].exists = true;
  return data[0];
}

function findModel(key, selectedCarCategory, selectedFresh, isPaidOnly = false) {
  const sanitizedKey = allowedTables.includes(key) ? key : null;
  let carCategoryTable = '';
  if (selectedCarCategory === 0) {
    carCategoryTable = 'carParts';
  } else if (selectedCarCategory === 1) {
    carCategoryTable = 'motoParts';
  } else if (selectedCarCategory === 3) {
    carCategoryTable = 'gruzParts';
  } else if (selectedCarCategory === 4) {
    carCategoryTable = 'commerParts';
  } else if (selectedCarCategory === 5) {
    carCategoryTable = 'specParts';
  }
  if (sanitizedKey) {
    let query = `SELECT key, address, name, image, chatUsername FROM ${carCategoryTable} WHERE ${sanitizedKey} = 1`;

    // Добавляем условие для selectedCarCategory, если оно задано
    if (selectedCarCategory !== null && selectedCarCategory !== undefined) {
      const parsedCategory = parseInt(selectedCarCategory);
      if (!isNaN(parsedCategory)) {
        // Проверяем, что whatType либо содержит значение parsedCategory,
        // либо равно '0' (если массив пустой)
        query += ` AND (whatType LIKE '%,${parsedCategory},%' 
                          OR whatType LIKE '${parsedCategory},%' 
                          OR whatType LIKE '%,${parsedCategory}' 
                          OR whatType = '${parsedCategory}')`;
      }
    }

    // Добавляем условие для selectedFresh, если оно задано
    if (selectedFresh !== null && selectedFresh !== undefined) {
      if (parseInt(selectedFresh) === 1) {
        query += ` AND isPartNew = ${parseInt(selectedFresh)}`;
      } else if (parseInt(selectedFresh) === 2) {
        query += ` AND isPartContract = ${parseInt(selectedFresh)}`;
      } else if (parseInt(selectedFresh) === 3) {
        query += ` AND isPartUsed = ${parseInt(selectedFresh)}`;
      }
    }

    // Фильтруем записи по isPayd
    if (isPaidOnly) {
      query += ` AND isPayd = 1`; // Фильтруем только оплаченные записи
    } else {
      query += ` AND isPayd = 0`; // Фильтруем только неоплаченные записи
    }

    try {
      const results = sqlite.run(query); // Используем sqlite.all для выборки всех строк
      return results || []; // Если результат пустой, возвращаем пустой массив
    } catch (err) {
      console.error("Ошибка при выполнении запроса:", err.message);
      return false;
    }
  } else {
    console.error("Недопустимое значение ключа:", key);
    return false;
  }
}

/* function getKeyBySynonym(input, chatId, msg, index) {
  const allowedTables = [
    'шиномонтаж',
    'авто сервис',
    'ремонт подвески',
    'ремонт генератора',
    'кузовной ремонт',
    'ремонт КПП',
    'диагностика',
    'эквакуатор',
    'ремонт дисков'
  ];

  for (const [key, values] of Object.entries(allowedTables)) {
    if (values.some(value => input.toLowerCase().includes(value.toLowerCase()))) {
      // If a match is found, return the key immediately
      model = findService(key);
      processCarDetailInput(chatId, msg, index);
    }
  }


  // If no match is found, return null or a default value
  return null;
} */


function findService(key, isPaidOnly = false) {
  if (key) {
    let query = `SELECT key, address, image, additional, chatUsername, name FROM service WHERE ${key} = 1`;

    // Добавляем условие для serviceTypeOrg
    if (serviceTypeOrg !== null && serviceTypeOrg !== undefined) {
      const parsedCategory = parseInt(serviceTypeOrg);
      if (!isNaN(parsedCategory)) {
        query += ` AND (is_organization = '2' OR is_organization = '${parsedCategory}')`;
      }
    }

    // Исправленное условие для serviceRegion
    if (serviceRegion !== null && serviceRegion !== undefined) {
      const parsedCategory = parseInt(serviceRegion);
      if (!isNaN(parsedCategory)) {
        // Используем комбинацию условий для поиска
        query += ` AND (
          region = '${parsedCategory}' OR 
          (',' || region || ',') LIKE '%,${parsedCategory},%'
        )`;
      }
    }

    // Условие для isPayd
    query += isPaidOnly ? ` AND isPayd = 1` : ` AND isPayd = 0`;

    console.log(query)

    try {
      // Используем sqlite.all для получения результатов
      const results = sqlite.run(query);
      return results || [];
    } catch (err) {
      console.error("Ошибка при выполнении запроса:", err.message);
      return false;
    }
  } else {
    return false;
  }
}


function findLawyer(key, isPaidOnly = false) {
  if (key) {
    let query = `SELECT key, address, image, additional, chatUsername, name FROM lawyer WHERE ${key} = 1`;


    // Условие для isPayd
    query += isPaidOnly ? ` AND isPayd = 1` : ` AND isPayd = 0`;


    try {
      // Используем sqlite.all для получения результатов
      const results = sqlite.run(query);
      console.log('results', results)
      return results || [];
    } catch (err) {
      console.error("Ошибка при выполнении запроса:", err.message);
      return false;
    }
  } else {
    return false;
  }
}

// Добавьте функцию форматирования текста
function formatText(text) {
  const maxLength = 255;
  if (!text) return '';

  if (text.length > maxLength) {
    const shortText = text.slice(0, maxLength) + '...';
    const encodedText = Buffer.from(text).toString('base64');
    return `
      ${shortText}
      <a href="tg://expand/${encodedText}">Показать полностью</a>
    `;
  }
  return text;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* function processCarDetailInput(chatId, detail, step) {
  if (step == 1) {
    bot.sendMessage(chatId, 'Теперь укажите деталь вашей машины:');
  } else if (step == 2) {
    const modelData = model;
    bot.sendMessage(chatId, 'Предлагаем вам связаться с одним из ниже перечисленных номеров:')
      .then(() => {
        if (modelData && modelData.length > 0) {
          return Promise.all(modelData.map(element => {
            const name = element.name ? element.name : 'не указано';
            const address = element.address ? element.address : 'не указано';
            const message = `Название компании: ${name},\nАдрес компании: ${address},\nНомер компании: ${element.key}`;
            return bot.sendMessage(chatId, message);
          }));
        }
      })
      .catch((error) => {
        console.log('Произошла ошибка при отправке сообщения:', error);
      });
  } else {
    bot.sendMessage(chatId, 'Можете связаться с одним из ниже перечисленных номеров:')
      .then(() => bot.sendMessage(chatId, '(тестовый номер)'))
      .catch((error) => {
        console.log('Произошла ошибка при отправке сообщения:', error);
      });
  }

  delete addMode[chatId]; // Предполагая, что 'addMode' - это структура данных для отслеживания состояния
} */