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
        callback_data: `brand_${brand}`
      }))),
      paginationButtons,
      [{
        text: "🔙 Главное меню",
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
