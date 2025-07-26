    inline_keyboard: [
      [{
        text: "🔍 Найти запчасти",
        callback_data: "find_command"
      }],
      [{
        text: "🔧 Выбрать сервис",
    reply_markup: keyboard
  });
}

// Обработчик команды /start
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

                  inline_keyboard: [
                    [{
                      text: "Начать чат",
                      url: chatUrl
                    }],
                    [{
                      text: "Назад к сервисам",
                      callback_data: "main_menu"
                    }]
                  ]
                };

                if (service.image) {
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
                  callback_data: "main_menu"
                }]
              ]
            };

            if (service.image) {
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
          reply_markup: {
            inline_keyboard: [
              [{
                text: "Назад к сервисам",
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
                  inline_keyboard: [
                    [{
                      text: "Начать чат",
                      url: chatUrl
                    }],
                    [{
                      text: "Назад к юристам",
                      callback_data: "main_menu"
                    }]
                  ]
                };

                if (lawyer.image) {
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
                  callback_data: "main_menu"
                }]
              ]
            };

            if (lawyer.image) {
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
  if (data === 'main_menu') {
    try {
      // Удаляем предыдущее сообщение с клавиатурой
      await bot.deleteMessage(chatId, query.message.message_id);
    } catch (error) {
      console.log('Ошибка при удалении сообщения:', error.message);
    }

    inline_keyboard: [
      [{
          text: "Для мототехники",
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
    reply_markup: sellHowKeyboard
  });
}

function showHowSell(chatId) {
  const sellHowKeyboard = {
    inline_keyboard: [
      [{
          text: "Продать (выкуп)",
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
    inline_keyboard: [
      ...keyboardRows.map(row => row.map(service => ({
        text: service.replace(/_/g, ' '),
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
    inline_keyboard: [
      ...keyboardRows.map(row => row.map(lawyer => ({
        text: lawyer.replace(/_/g, ' '),
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
