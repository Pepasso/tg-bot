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
  showPartsFresh,
  showBrandsPage,
  showServicesPage,
  showHowSell,
} = require('../utils/menus');
const {
  findModel,
  findService,
  findSellCars,
  findLawyer,
  findProductByType,
} = require('../services/searchService');
const {
  getSellerChatId,
  sendMessageToSeller,
  getAndreyChatId
} = require('../services/senderService');
const fs = require('fs');

async function showSellerInfo(bot, chatId, query, state) {
  // Подготавливаем сообщение для продавца
  let usernameInfo = '';
  if (query.from.username) {
    usernameInfo = ` (USERNAME: @${query.from.username})`;
  }

  const sellerMessage = `
  🆕 Новый запрос на покупку/продажу авто!
  Вид ТС: ${state.sellTCType}
  Выбранный способ: ${state.sellHow}
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
    const isSent = await sendMessageToSeller(bot, sellerTgId, sellerMessage);

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

          await sendMessageToSeller(bot, sellerData[0].tgId, sellerMessage);
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

function registerCallbackHandler(bot, state) {
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const [action, ...params] = data.split('_');

    // Initialize state if it doesn't exist
    if (!state[chatId]) {
      state[chatId] = {};
    }

    try {
      await bot.deleteMessage(chatId, query.message.message_id);
    } catch (error) {
      // ignore
    }

    switch (action) {
      case 'find':
        state[chatId].currentPage = 0;
        showCategoryKeyboard(bot, chatId);
        break;
      case 'command':
        if (params[0] === 'service') {
          showServiceRegionKeyboard(bot, chatId);
        } else if (params[0] === 'lawyer') {
          state[chatId].currentLawyersPage = 0;
          showLawyersPage(bot, chatId, 0);
        }
        break;
      case 'page':
        const page = parseInt(params[0]);
        state[chatId].currentPage = page;
        showBrandsPage(bot, chatId, page);
        break;
      case 'servicepage':
        const servicePage = parseInt(params[0]);
        state[chatId].currentServicePage = servicePage;
        showServicesPage(bot, chatId, servicePage);
        break;
      case 'lawyerpage':
        const lawyerPage = parseInt(params[0]);
        state[chatId].currentLawyersPage = lawyerPage;
        showLawyersPage(bot, chatId, lawyerPage);
        break;
      case 'category':
        state[chatId].selectedCarCategory = parseInt(params[0]);
        showPartsFresh(bot, chatId);
        break;
      case 'fresh':
        state[chatId].selectedFresh = parseInt(params[0]);
        state[chatId].currentPage = 0;
        showBrandsPage(bot, chatId, 0);
        break;
      case 'brand':
        const brand = params[0];
        const paidResults = findModel(brand, state[chatId].selectedCarCategory, state[chatId].selectedFresh, true);
        const otherResults = findModel(brand, state[chatId].selectedCarCategory, state[chatId].selectedFresh, false);

        if (paidResults && paidResults.length > 0) {
          for (const part of paidResults) {
            const phones = part.key.split(', ').map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`).join(', ');
            const clientMessageText = `
              🔧 ${part.name}
              📍 Адрес: ${part.address}
              📞 Телефоны: ${phones}

              ℹ️ Сообщение продавцу успешно отправлено! Вы можете начать чат, нажав на кнопку ниже.
            `;

            if (part.chatUsername && part.chatUsername.trim() !== '') {
              const sellerTgId = parseInt(getSellerChatId(part.chatUsername)[0].tgId);
              if (sellerTgId) {
                const sellerMessage = `
                  Марка: ${brand}
                  Качество: ${state[chatId].selectedFresh}
                  Категория: ${state[chatId].selectedCarCategory}
                  Клиент: ${query.message.from.first_name} (${query.message.from.id})
                `;
                const isSent = await sendMessageToSeller(bot, sellerTgId, sellerMessage);
                if (isSent) {
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
                  if (part.image && part.image.startsWith('./')) {
                    bot.sendPhoto(chatId, fs.createReadStream(part.image), {
                      caption: clientMessageText,
                      parse_mode: 'HTML',
                      reply_markup: chatKeyboard
                    });
                  } else {
                    bot.sendMessage(chatId, clientMessageText, {
                      parse_mode: 'HTML',
                      reply_markup: chatKeyboard
                    });
                  }
                } else {
                  bot.sendMessage(chatId, '❌ Не удалось отправить сообщение продавцу. Возможно, он заблокировал бота или не начал с ним диалог.');
                }
              } else {
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

        if (otherResults && otherResults.length > 0) {
          const otherPartsList = otherResults.map(part => {
            const phones = part.key.split(', ').map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`).join(', ');
            return `🔧 ${part.name}\n📍 Адрес: ${part.address}\n📞 Телефоны: ${phones}`;
          }).join('\n\n');
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
        } else if (!paidResults || (paidResults.length === 0 && !otherResults)) {
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
        break;
      case 'serviceregion':
        state[chatId].serviceRegion = parseInt(params[0]);
        state[chatId].currentServicePage = 0;
        showServicesPage(bot, chatId, 0);
        break;
      case 'service':
        const serviceKey = params.join('_');
        const originalServiceKey = serviceKey.replace(/_/g, ' ');
        const paidServices = findService(serviceKey, state[chatId].serviceTypeOrg, state[chatId].serviceRegion, true);
        const otherServices = findService(serviceKey, state[chatId].serviceTypeOrg, state[chatId].serviceRegion, false);

        if (paidServices && paidServices.length > 0) {
          for (const service of paidServices) {
            const phones = service.key.split(', ').map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`).join(', ');
            const clientMessage = `
              🔧 ${service.name}
              📍 Адрес: ${service.address}
              📞 Телефоны: ${phones}

              ${service.additional || ''}
            `.replace(/^[ \t]+/gm, '').trim();

            if (service.chatUsername) {
              const sellerTgId = getSellerChatId(service.chatUsername)[0].tgId;
              if (sellerTgId) {
                const sellerMessage = `
                  Услуга: ${originalServiceKey}
                  Клиент: ${query.message.from.first_name} (${query.message.from.id})
                `;
                const isSent = await sendMessageToSeller(bot, sellerTgId, sellerMessage);
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
                    bot.sendPhoto(chatId, fs.createReadStream(service.image), {
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
                bot.sendPhoto(chatId, fs.createReadStream(service.image), {
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

        if (otherServices && otherServices.length > 0) {
          const otherServicesList = otherServices.map(service => {
            const phones = service.key.split(', ').map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`).join(', ');
            return `🔧 ${service.name}\n📍 Адрес: ${service.address}\n📞 Телефоны: ${phones}`;
          }).join('\n\n');
          bot.sendMessage(chatId, `✅ Найдены сервисы для ${originalServiceKey}:\n\n${otherServicesList}`, {
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
        } else if (!paidServices || (paidServices.length === 0 && !otherServices)) {
          bot.sendMessage(chatId, `😞 Ничего не найдено для "${originalServiceKey}"`, {
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
        break;
      case 'lawyer':
        const lawyerKey = params.join('_');
        const originalLawyerKey = lawyerKey.replace(/_/g, ' ');
        const paidLawyers = findLawyer(lawyerKey, true);
        const otherLawyers = findLawyer(lawyerKey, false);

        if (paidLawyers && paidLawyers.length > 0) {
          for (const lawyer of paidLawyers) {
            const phones = lawyer.key.split(', ').map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`).join(', ');
            const clientMessage = `
              🔧 ${lawyer.name}
              📍 Адрес: ${lawyer.address}
              📞 Телефоны: ${phones}

              ${lawyer.additional}
            `.replace(/^[ \t]+/gm, '').trim();

            if (lawyer.chatUsername) {
              const sellerTgId = getSellerChatId(lawyer.chatUsername)[0].tgId;
              if (sellerTgId) {
                const sellerMessage = `
                  Юридическая помощь: ${originalLawyerKey}
                  Клиент: ${query.message.from.first_name} (${query.message.from.id})
                `;
                const isSent = await sendMessageToSeller(bot, sellerTgId, sellerMessage);
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
                    bot.sendPhoto(chatId, fs.createReadStream(lawyer.image), {
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
              const keyboard = {
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
              };
              if (lawyer.image) {
                bot.sendPhoto(chatId, fs.createReadStream(lawyer.image), {
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

        if (otherLawyers && otherLawyers.length > 0) {
          const otherLawyersList = otherLawyers.map(lawyer => {
            const phones = lawyer.key.split(', ').map(num => `<a href="tel:${num.trim()}">${num.trim()}</a>`).join(', ');
            return `
              🔧 ${lawyer.name}
              📍 Адрес: ${lawyer.address}
              📞 Телефоны: ${phones}
              ${lawyer.additional ? `\n${lawyer.additional}` : ''}
            `.replace(/^[ \t]+/gm, '').trim();
          }).join('\n\n');
          bot.sendMessage(chatId, `✅ Найдены юристы для ${originalLawyerKey}:\n\n${otherLawyersList}`, {
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
        } else if (!paidLawyers || (paidLawyers.length === 0 && !otherLawyers)) {
          bot.sendMessage(chatId, `😞 Ничего не найдено для "${originalLawyerKey}"`, {
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
        break;
      case 'sell':
        if (params[0] === 'command') {
          showSellType(bot, chatId);
        } else if (params[0] === 'type') {
          state[chatId].sellTCType = params[1];
          showHowSell(bot, chatId);
        } else if (params[0] === 'how') {
          state[chatId].sellHow = params[1];
          showSellerInfo(bot, chatId, query, state[chatId]);
        }
        break;
      case 'products':
        if (params[0] === 'command') {
          showProductsType(bot, chatId);
        } else if (params[0] === 'type') {
          state[chatId].productType = params[1];
          const products = findProductByType(state[chatId].productType);
          if (products && products.length > 0) {
            const productList = products.map(product => {
              return `🛞 <b>${product.name}</b>\n💰 Цена: ${product.price || 'Не указана'}\n📞 Тел: ${product.phone || ''}\n💬 ${product.description || ''}`;
            }).join('\n\n');
            bot.sendMessage(chatId, productList, {
              parse_mode: 'HTML'
            });
          } else {
            bot.sendMessage(chatId, '🚫 Продуктов данного типа не найдено.');
          }
        }
        break;
      case 'main':
        sendMainMenu(bot, chatId);
        break;
      case 'help':
        bot.sendMessage(chatId, '📖 Помощь по боту:\n\nЕсли возникли проблемы — напишите @Gae4kinChaT');
        break;
      default:
        // Default case to handle unrecognized callbacks
        break;
    }

    bot.answerCallbackQuery(query.id);
  });
}

module.exports = {
  registerCallbackHandler
};