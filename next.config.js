/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['ru', 'en', 'es'],
    defaultLocale: 'ru',
    domains: [
      {
        domain: 'lms.ns-tech.es',
        defaultLocale: 'ru',
        locales: ['ru', 'en', 'es'],
      },
      {
        domain: 'ru.lms.ns-tech.es',
        locales: ['ru'], // <-- убрали defaultLocale
      },
      {
        domain: 'en.lms.ns-tech.es',
        defaultLocale: 'en',
        locales: ['en'],
      },
      {
        domain: 'es.lms.ns-tech.es',
        defaultLocale: 'es',
        locales: ['es'],
      },
    ],
    localeDetection: false,
  },
};

module.exports = nextConfig;
