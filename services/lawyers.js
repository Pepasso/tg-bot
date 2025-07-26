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
  if (data.startsWith('lawyer_page_')) {
    const page = parseInt(data.split('_')[2]);
    currentLawyerPage = page;
    bot.deleteMessage(chatId, query.message.message_id);
    showLawyersPage(chatId, page);
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
                      callback_data: "command_lawyer"
                    }],
                    [{
                      text: "🔙 Главное меню",
                  callback_data: "command_lawyer"
                }],
                [{
                  text: "🔙 Главное меню",
                callback_data: "command_lawyer"
              }],
              [{
                text: "🔙 Главное меню",
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
        callback_data: `lawyer_${lawyer.replace(/\s+/g, '_')}`
      }))),
      paginationButtons,
      [{
        text: "🔙 Главное меню",
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

