// online-courses/lib/db-client.ts
import { Pool } from 'pg';

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const pool = new Pool({
  connectionString: connectionString,
  // Для локального Docker-соединения SSL не требуется.
  // Если вы все же столкнетесь с ошибками SSL, убедитесь, что в строке подключения нет `sslmode=require`
  // или установите `ssl: false` здесь.
  ssl: false, // Отключаем SSL для локального соединения Docker
});

export default pool;