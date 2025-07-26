        callback_data: "command_service"
      }],
      [{
        text: "⚖️ Выбрать юр.услугу",
    case 'command_service':
      bot.deleteMessage(chatId, query.message.message_id);
      // showSerivceTypeKeyboard(chatId)
      showSerivceRegionKeyboard(chatId);
      break;

  if (data.startsWith('service_page_')) {
    const page = parseInt(data.split('_')[2]);
    currentServicePage = page;
    bot.deleteMessage(chatId, query.message.message_id);
    showServicesPage(chatId, page);
  }

  // Обработка пагинации юристов
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
                      callback_data: "command_service"
                    }],
                    [{
                      text: "🔙 Главное меню",
                  callback_data: "command_service"
                }],
                [{
                  text: "🔙 Главное меню",
                callback_data: "command_service"
              }],
              [{
                text: "🔙 Главное меню",
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

  if (data.startsWith("serviceregion_")) {
    const serviceregion = parseInt(data.split("_")[1]); // Извлекаем номер категории (1, 2, 3 или 4)
    serviceRegion = serviceregion;
    bot.deleteMessage(chatId, query.message.message_id);
    // Показать страницу с марками автомобилей
    currentServicePage = 0; // Сброс пагинации
    showServicesPage(chatId, 0);
  }

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
        callback_data: `service_${service.replace(/\s+/g, '_')}`
      }))),
      paginationButtons,
      [{
        text: "🔙 Главное меню",
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


