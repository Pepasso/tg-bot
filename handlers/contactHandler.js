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
