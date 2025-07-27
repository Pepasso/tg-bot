// utils/textUtils.js

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatText(text, maxLength = 255) {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const shortText = text.slice(0, maxLength) + '...';
  const encoded = Buffer.from(text).toString('base64');
  return `${shortText}\n<a href="tg://expand/${encoded}">Показать полностью</a>`;
}

module.exports = {
  delay,
  formatText,
};