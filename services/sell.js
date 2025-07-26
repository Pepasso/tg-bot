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
