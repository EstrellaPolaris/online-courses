// online-courses/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['ru', 'en', 'es'],
    defaultLocale: 'ru',
    domains: [
      // Основной домен для prod-среды (например, lms.ns-tech.es)
      {
        domain: 'lms.ns-tech.es',
        defaultLocale: 'ru',
      },
      // Языковые поддомены для prod-среды
      {
        domain: 'ru.lms.ns-tech.es',
        defaultLocale: 'ru',
      },
      {
        domain: 'en.lms.ns-tech.es',
        defaultLocale: 'en',
      },
      {
        domain: 'es.lms.ns-tech.es',
        defaultLocale: 'es',
      },
      // Vercel также создает preview-домены (например, online-courses-lms-xxxx.vercel.app),
      // но их не нужно явно указывать здесь, Vercel сам их обрабатывает.
    ],
    localeDetection: false,
  },
};

module.exports = nextConfig;
