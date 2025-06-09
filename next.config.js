// online-courses/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['ru', 'en', 'es'], // Общие локали, которые поддерживает ваше приложение
    defaultLocale: 'ru',
    domains: [
      // Основной домен для prod-среды
      {
        domain: 'lms.ns-tech.es',
        defaultLocale: 'ru',
        locales: ['ru', 'en', 'es'], // <-- ДОБАВЛЕНО: Укажите все поддерживаемые локали
      },
      // Языковые поддомены для prod-среды
      {
        domain: 'ru.lms.ns-tech.es',
        defaultLocale: 'ru',
        locales: ['ru'], // <-- ДОБАВЛЕНО: Для ru.lms.ns-tech.es используется только ru
      },
      {
        domain: 'en.lms.ns-tech.es',
        defaultLocale: 'en',
        locales: ['en'], // <-- ДОБАВЛЕНО: Для en.lms.ns-tech.es используется только en
      },
      {
        domain: 'es.lms.ns-tech.es',
        defaultLocale: 'es',
        locales: ['es'], // <-- ДОБАВЛЕНО: Для es.lms.ns-tech.es используется только es
      },
    ],
    localeDetection: false,
  },
};

module.exports = nextConfig;
