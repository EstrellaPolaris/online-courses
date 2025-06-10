// online-courses/lib/db.ts
// РЕАЛЬНОЕ ВЗАИМОДЕЙСТВИЕ С БД (Прямые SQL-запросы через pg)

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Course,
  AccessToken,
  UserRole,
  TokenStatus,
  CreateAccessTokenData,
  CourseCategory,
  Chapter,
  Payment,
  PaymentStatus,
  Subscription,
  MagicLinkToken,
} from '@/types';

// ИСПРАВЛЕНИЕ: Используем пользовательский интерфейс для глобального объекта,
// чтобы избежать ошибок TypeScript, связанных с NodeJS.Global.
interface CustomGlobal {
  pgPool?: Pool;
}
const globalWithPgPool = global as CustomGlobal;

// Инициализация пула подключений к базе данных.
// Глобальный объект (globalWithPgPool.pgPool) используется для предотвращения
// создания множественных подключений при горячей перезагрузке Next.js.
if (!globalWithPgPool.pgPool) {
  if (process.env.DATABASE_URL) {
    // Подключение к Neon/PostgreSQL через Vercel.
    globalWithPgPool.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Часто необходимо для облачных БД, если нет CA сертификата
      }
    });
    console.log("DB: Connected using DATABASE_URL");
  } else {
    // Fallback для локальной разработки.
    globalWithPgPool.pgPool = new Pool({
      user: process.env.POSTGRES_USER,
      host: process.env.DB_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log("DB: Connected using individual environment variables (fallback)");
  }
}

// ИСПРАВЛЕНИЕ: Используем 'const' вместо 'let' для пула.
export const pool: Pool = globalWithPgPool.pgPool!;

// Обработка ошибок пула подключений.
pool.on('error', (err) => {
  console.error('DB: Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = {
  // --- USERS ---
  getUserById: async (id: string): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      const dbUser = res.rows[0];

      if (!dbUser) return null;

      const purchasedCoursesRes = await client.query(
        'SELECT course_id FROM user_purchased_courses WHERE user_id = $1',
        [id]
      );
      const purchasedCourseIds = purchasedCoursesRes.rows.map(row => row.course_id);

      return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        emailVerified: dbUser.email_verified,
        hashedPassword: dbUser.hashed_password || undefined,
        image: dbUser.image || undefined,
        role: dbUser.role as UserRole,
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at),
        platformAccessTier: dbUser.platform_access_tier || undefined,
        studentSlotsAvailable: dbUser.student_slots_available || undefined,
        teacherEarnings: dbUser.teacher_earnings || undefined,
        purchasedCourseIds: purchasedCourseIds,
      };
    } finally {
      client.release();
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      const dbUser = res.rows[0];

      if (!dbUser) return null;

      const purchasedCoursesRes = await client.query(
        'SELECT course_id FROM user_purchased_courses WHERE user_id = $1',
        [dbUser.id]
      );
      const purchasedCourseIds = purchasedCoursesRes.rows.map(row => row.course_id);

      return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        emailVerified: dbUser.email_verified,
        hashedPassword: dbUser.hashed_password || undefined,
        image: dbUser.image || undefined,
        role: dbUser.role as UserRole,
        createdAt: new Date(dbUser.created_at),
        updatedAt: new Date(dbUser.updated_at),
        platformAccessTier: dbUser.platform_access_tier || undefined,
        studentSlotsAvailable: dbUser.student_slots_available || undefined,
        teacherEarnings: dbUser.teacher_earnings || undefined,
        purchasedCourseIds: purchasedCourseIds,
      };
    } finally {
      client.release();
    }
  },

  updateUser: async (user: User): Promise<User> => {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE users
         SET username = $1, email = $2, role = $3, platform_access_tier = $4, student_slots_available = $5,
             email_verified = $7, hashed_password = $8, image = $9, teacher_earnings = $10,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [
          user.username,
          user.email,
          user.role,
          user.platformAccessTier || null,
          user.studentSlotsAvailable || 0,
          user.id,
          user.emailVerified,
          user.hashedPassword || null,
          user.image || null,
          user.teacherEarnings || null
        ]
      );
      const updatedUser = res.rows[0];

      if (!updatedUser) throw new Error('User not found for update');

      const purchasedCoursesRes = await client.query(
        'SELECT course_id FROM user_purchased_courses WHERE user_id = $1',
        [user.id]
      );
      const purchasedCourseIds = purchasedCoursesRes.rows.map(row => row.course_id);

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        emailVerified: updatedUser.email_verified,
        hashedPassword: updatedUser.hashed_password || undefined,
        image: updatedUser.image || undefined,
        role: updatedUser.role as UserRole,
        createdAt: new Date(updatedUser.created_at),
        updatedAt: new Date(updatedUser.updated_at),
        platformAccessTier: updatedUser.platform_access_tier || undefined,
        studentSlotsAvailable: updatedUser.student_slots_available || undefined,
        teacherEarnings: updatedUser.teacher_earnings || undefined,
        purchasedCourseIds: purchasedCourseIds,
      };
    } finally {
      client.release();
    }
  },

  createUser: async (user: Omit<User, 'id' | 'purchasedCourseIds' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const client = await pool.connect();
    try {
      const id = uuidv4();
      const res = await client.query(
        `INSERT INTO users (id, username, email, role, platform_access_tier, student_slots_available, email_verified, hashed_password, image, teacher_earnings, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
        [
          id,
          user.username,
          user.email,
          user.role,
          user.platformAccessTier || null,
          user.studentSlotsAvailable || 0,
          user.emailVerified,
          user.hashedPassword || null,
          user.image || null,
          user.teacherEarnings || null
        ]
      );
      const newUser = res.rows[0];

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        emailVerified: newUser.email_verified,
        hashedPassword: newUser.hashed_password || undefined,
        image: newUser.image || undefined,
        role: newUser.role as UserRole,
        createdAt: new Date(newUser.created_at),
        updatedAt: new Date(newUser.updated_at),
        platformAccessTier: newUser.platform_access_tier || undefined,
        studentSlotsAvailable: newUser.student_slots_available || undefined,
        teacherEarnings: newUser.teacher_earnings || undefined,
        purchasedCourseIds: [],
      };
    } finally {
      client.release();
    }
  },

  // --- COURSES ---
  getCourseById: async (id: string): Promise<Course | null> => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM courses WHERE id = $1', [id]);
      const course = res.rows[0];

      if (!course) return null;

      const chapters: Chapter[] = []; // Заглушка, если главы хранятся отдельно

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.image_url || undefined,
        price: parseFloat(course.price),
        currency: course.currency || 'RUB',
        instructorId: course.instructor_id,
        category: course.category as CourseCategory,
        isPublished: course.is_published,
        createdAt: new Date(course.created_at),
        updatedAt: new Date(course.updated_at),
        chapters: chapters,
        studentsEnrolled: course.students_enrolled || 0,
        students: course.students_enrolled || 0,
        isArchived: course.is_archived || false,
        rating: course.rating || undefined,
        reviewsCount: course.reviews_count || undefined,
      };
    } finally {
      client.release();
    }
  },

  getAllCourses: async (): Promise<Course[]> => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM courses');
      return res.rows.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.image_url || undefined,
        price: parseFloat(course.price),
        currency: course.currency || 'RUB',
        instructorId: course.instructor_id,
        category: course.category as CourseCategory,
        isPublished: course.is_published,
        createdAt: new Date(course.created_at),
        updatedAt: new Date(course.updated_at),
        chapters: [],
        studentsEnrolled: course.students_enrolled || 0,
        students: course.students_enrolled || 0,
        isArchived: course.is_archived || false,
        rating: course.rating || undefined,
        reviewsCount: course.reviews_count || undefined,
      }));
    } finally {
      client.release();
    }
  },

  getCoursesByInstructor: async (instructorId: string): Promise<Course[]> => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM courses WHERE instructor_id = $1', [instructorId]);
      return res.rows.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.image_url || undefined,
        price: parseFloat(course.price),
        currency: course.currency || 'RUB',
        instructorId: course.instructor_id,
        category: course.category as CourseCategory,
        isPublished: course.is_published,
        createdAt: new Date(course.created_at),
        updatedAt: new Date(course.updated_at),
        chapters: [],
        studentsEnrolled: course.students_enrolled || 0,
        students: course.students_enrolled || 0,
        isArchived: course.is_archived || false,
        rating: course.rating || undefined,
        reviewsCount: course.reviews_count || undefined,
      }));
    } finally {
      client.release();
    }
  },

  createCourse: async (courseData: Omit<Course, 'id' | 'chapters' | 'studentsEnrolled' | 'isArchived' | 'rating' | 'reviewsCount' | 'createdAt' | 'updatedAt'>): Promise<Course> => {
    const client = await pool.connect();
    try {
      const id = uuidv4();
      const res = await client.query(
        `INSERT INTO courses (id, title, description, image_url, price, currency, instructor_id, category, is_published, students_enrolled, is_archived, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
        [
          id,
          courseData.title,
          courseData.description,
          courseData.imageUrl || null,
          courseData.price,
          courseData.currency,
          courseData.instructorId,
          courseData.category,
          courseData.isPublished,
          0,
          false
        ]
      );
      const newCourse = res.rows[0];

      return {
        id: newCourse.id,
        title: newCourse.title,
        description: newCourse.description,
        imageUrl: newCourse.image_url || undefined,
        price: parseFloat(newCourse.price),
        currency: newCourse.currency,
        instructorId: newCourse.instructor_id,
        category: newCourse.category as CourseCategory,
        isPublished: newCourse.is_published,
        createdAt: new Date(newCourse.created_at),
        updatedAt: new Date(newCourse.updated_at),
        chapters: [],
        studentsEnrolled: newCourse.students_enrolled,
        students: newCourse.students_enrolled,
        isArchived: newCourse.is_archived,
        rating: newCourse.rating || undefined,
        reviewsCount: newCourse.reviews_count || undefined,
      };
    } finally {
      client.release();
    }
  },

  // --- ACCESS TOKENS ---
  createAccessToken: async (data: CreateAccessTokenData): Promise<AccessToken> => {
    const client = await pool.connect();
    try {
      const id = uuidv4();
      const token = uuidv4();
      const res = await client.query(
        `INSERT INTO access_tokens (id, token, user_id, entity_type, entity_id, access_details, status, yookassa_payment_id, generated_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9) RETURNING *`,
        [id, token, data.userId, data.entityType, data.entityId, JSON.stringify(data.accessDetails || {}), 'pending', data.yookassaPaymentId || null, data.expiresAt || null]
      );
      const newAccessToken = res.rows[0];

      return {
        id: newAccessToken.id,
        token: newAccessToken.token,
        userId: newAccessToken.user_id,
        entityType: newAccessToken.entity_type,
        entityId: newAccessToken.entity_id,
        accessDetails: newAccessToken.access_details,
        status: newAccessToken.status as TokenStatus,
        generatedAt: new Date(newAccessToken.generated_at),
        activatedAt: newAccessToken.activated_at ? new Date(newAccessToken.activated_at) : undefined,
        expiresAt: newAccessToken.expires_at ? new Date(newAccessToken.expires_at) : undefined,
        yookassaPaymentId: newAccessToken.yookassa_payment_id || undefined,
      };
    } finally {
      client.release();
    }
  },

  getAccessTokenByTokenString: async (tokenString: string): Promise<AccessToken | null> => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM access_tokens WHERE token = $1', [tokenString]);
      const token = res.rows[0];

      if (!token) return null;

      return {
        id: token.id,
        token: token.token,
        userId: token.user_id,
        entityType: token.entity_type,
        entityId: token.entity_id,
        accessDetails: token.access_details,
        status: token.status as TokenStatus,
        generatedAt: new Date(token.generated_at),
        activatedAt: token.activated_at ? new Date(token.activated_at) : undefined,
        expiresAt: token.expires_at ? new Date(token.expires_at) : undefined,
        yookassaPaymentId: token.yookassa_payment_id || undefined,
      };
    } finally {
      client.release();
    }
  },

  updateAccessToken: async (token: AccessToken): Promise<AccessToken> => {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE access_tokens
         SET status = $1, activated_at = $2, expires_at = $3, access_details = $4, yookassa_payment_id = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 RETURNING *`,
        [token.status, token.activatedAt || null, token.expiresAt || null, JSON.stringify(token.accessDetails || {}), token.id, token.yookassaPaymentId || null]
      );
      const updatedToken = res.rows[0];

      if (!updatedToken) throw new Error('Access token not found for update');

      return {
        id: updatedToken.id,
        token: updatedToken.token,
        userId: updatedToken.user_id,
        entityType: updatedToken.entity_type,
        entityId: updatedToken.entity_id,
        accessDetails: updatedToken.access_details,
        status: updatedToken.status as TokenStatus,
        generatedAt: new Date(updatedToken.generated_at),
        activatedAt: updatedToken.activated_at ? new Date(updatedToken.activated_at) : undefined,
        expiresAt: updatedToken.expires_at ? new Date(updatedToken.expires_at) : undefined,
        yookassaPaymentId: updatedToken.yookassa_payment_id || undefined,
      };
    } finally {
      client.release();
    }
  },

  // --- Вспомогательные функции для обновления доступа пользователей ---
  addCourseToStudent: async (userId: string, courseId: string) => {
    const client = await pool.connect();
    try {
      const checkRes = await client.query(
        'SELECT 1 FROM user_purchased_courses WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      if (checkRes.rows.length === 0) {
        await client.query(
          'INSERT INTO user_purchased_courses (user_id, course_id) VALUES ($1, $2)',
          [userId, courseId]
        );
        console.log(`DB: Course ${courseId} connected to student ${userId}.`);
      } else {
        console.log(`DB: Student ${userId} already has course ${courseId}.`);
      }
    } finally {
      client.release();
    }
  },

  addStudentSlotsToTeacher: async (userId: string, slots: number) => {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE users
         SET student_slots_available = student_slots_available + $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND role = 'teacher' RETURNING *`,
        [slots, userId]
      );
      const updatedUser = res.rows[0];
      if (updatedUser) {
        console.log(`DB: Added ${slots} slots to teacher ${userId}. Total: ${updatedUser.student_slots_available}`);
      } else {
        console.warn(`DB: Teacher ${userId} not found or not a teacher to add slots.`);
      }
    } finally {
      client.release();
    }
  },

  // --- Payment methods ---
  getPaymentById: async (paymentId: string): Promise<Payment | null> => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
      const payment = res.rows[0];
      if (!payment) return null;

      return {
        id: payment.id,
        userId: payment.user_id,
        amount: parseFloat(payment.amount),
        currency: payment.currency,
        paymentSystemId: payment.payment_system_id || undefined,
        status: payment.status as PaymentStatus,
        createdAt: new Date(payment.created_at),
        updatedAt: new Date(payment.updated_at),
      };
    } finally {
      client.release();
    }
  },

  updatePaymentStatus: async (paymentId: string, status: PaymentStatus): Promise<Payment> => {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE payments
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
        [status, paymentId]
      );
      const updatedPayment = res.rows[0];
      if (!updatedPayment) throw new Error('Payment not found for update');

      return {
        id: updatedPayment.id,
        userId: updatedPayment.user_id,
        amount: parseFloat(updatedPayment.amount),
        currency: updatedPayment.currency,
        paymentSystemId: updatedPayment.payment_system_id || undefined,
        status: updatedPayment.status as PaymentStatus,
        createdAt: new Date(updatedPayment.created_at),
        updatedAt: new Date(updatedPayment.updated_at),
      };
    } finally {
      client.release();
    }
  },

  // --- Subscription methods ---
  getUserSubscription: async (userId: string): Promise<Subscription | null> => {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY end_date DESC LIMIT 1', [userId]);
      const subscription = res.rows[0];
      if (!subscription) return null;

      return {
        id: subscription.id,
        userId: subscription.user_id,
        planId: subscription.plan_id,
        startDate: new Date(subscription.start_date),
        endDate: new Date(subscription.end_date),
        isActive: subscription.is_active,
      };
    } finally {
      client.release();
    }
  },

  // --- Invite Code methods (Placeholder for now) ---
  saveInviteCode: async (email: string, role: UserRole, inviteCode: string, expiresAt: Date) => {
    console.log(`DB: Saving invite code ${inviteCode} for ${email} with role ${role}, expires ${expiresAt.toISOString()}`);
    return Promise.resolve();
  },

  // --- User Role Update (Placeholder for now) ---
  updateUserRole: async (userId: string, newRole: UserRole) => {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [newRole, userId]
      );
      if (res.rows.length === 0) {
        throw new Error(`User with ID ${userId} not found.`);
      }
      console.log(`DB: User ${userId} role updated to ${newRole}.`);
    } finally {
      client.release();
    }
  },

  // --- Magic Link Token methods ---
  createMagicLinkToken: async (userId: string, token: string, expiresAt: Date): Promise<MagicLinkToken> => {
    const client = await pool.connect();
    try {
      const id = uuidv4();
      const res = await client.query(
        `INSERT INTO magic_link_tokens (id, token, user_id, expires_at, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`,
        [id, token, userId, expiresAt]
      );
      const newMagicToken = res.rows[0];
      console.log('DB: MagicLinkToken created:', { id: newMagicToken.id, userId: newMagicToken.user_id, expiresAt: newMagicToken.expires_at, tokenSubstring: newMagicToken.token.substring(0, 10) + '...' });
      return {
        id: newMagicToken.id,
        token: newMagicToken.token,
        userId: newMagicToken.user_id,
        expiresAt: new Date(newMagicToken.expires_at),
        usedAt: newMagicToken.used_at ? new Date(newMagicToken.used_at) : undefined,
        createdAt: new Date(newMagicToken.created_at),
      };
    } finally {
      client.release();
    }
  },

  // ИСПРАВЛЕНО/ИЗМЕНЕНО: ВРЕМЕННО УПРОЩЕН ДЛЯ ОТЛАДКИ.
  // Теперь просто ищет токен по строке токена, без проверки used_at и expires_at.
  getMagicLinkToken: async (token: string): Promise<MagicLinkToken | null> => {
    const client = await pool.connect();
    try {
      // ИСПРАВЛЕНО: Упрощенный запрос для отладки
      const res = await client.query('SELECT * FROM magic_link_tokens WHERE token = $1', [token]);
      const magicToken = res.rows[0];
      console.log('DB: getMagicLinkToken result for token:', token.substring(0, 10) + '...', 'Found:', !!magicToken);
      if (!magicToken) return null;
      return {
        id: magicToken.id,
        token: magicToken.token,
        userId: magicToken.user_id,
        expiresAt: new Date(magicToken.expires_at),
        usedAt: magicToken.used_at ? new Date(magicToken.used_at) : undefined,
        createdAt: new Date(magicToken.created_at),
      };
    } finally {
      client.release();
    }
  },

  invalidateMagicLinkToken: async (id: string): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('UPDATE magic_link_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
      console.log('DB: MagicLinkToken invalidated:', id);
    } finally {
      client.release();
    }
  },

  // ИСПРАВЛЕНО: Функция для инициализации тестовых данных (седирования).
  seed: async () => {
    console.log('Seeding initial data...');
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM user_purchased_courses');
      await client.query('DELETE FROM access_tokens');
      await client.query('DELETE FROM courses');
      await client.query('DELETE FROM magic_link_tokens');
      await client.query('DELETE FROM users');
      await client.query('DELETE FROM payments');
      await client.query('DELETE FROM subscriptions');
      console.log('Existing data cleared.');

      const studentId = uuidv4();
      const teacherId = uuidv4();
      const adminId = uuidv4();

      const courseAiId = uuidv4();
      const courseWebDevId = uuidv4();
      const courseExclusiveId = uuidv4();

      await client.query(
        `INSERT INTO users (id, username, email, role, platform_access_tier, student_slots_available, email_verified, created_at, updated_at) VALUES
         ($1, 'user123', 'student@example.com', 'student', 'free', 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($2, 'teacher456', 'teacher@example.com', 'teacher', 'free', 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($3, 'admin789', 'admin@example.com', 'admin', 'free', 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
        [studentId, teacherId, adminId]
      );
      console.log('Test users seeded.');

      const coursesToInsert = [
        { id: courseAiId, title: 'Основы ИИ', description: 'Курс по основам искусственного интеллекта.', instructorId: teacherId, price: 99.99, currency: 'RUB', category: 'programming' as CourseCategory, isPublished: true, studentsEnrolled: 10, isArchived: false },
        { id: courseWebDevId, title: 'Fullstack Web-разработка', description: 'Полный курс по веб-разработке.', instructorId: teacherId, price: 199.99, currency: 'RUB', category: 'programming' as CourseCategory, isPublished: true, studentsEnrolled: 50, isArchived: false },
        { id: courseExclusiveId, title: 'Мой Эксклюзивный Курс', description: 'Курс от платформы.', instructorId: adminId, price: 150.00, currency: 'RUB', category: 'other' as CourseCategory, isPublished: true, studentsEnrolled: 5, isArchived: false },
      ];

      for (const courseData of coursesToInsert) {
        await client.query(
          `INSERT INTO courses (id, title, description, image_url, price, currency, instructor_id, category, is_published, students_enrolled, is_archived, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            courseData.id,
            courseData.title,
            courseData.description,
            null,
            courseData.price,
            courseData.currency,
            courseData.instructorId,
            courseData.category,
            courseData.isPublished,
            courseData.studentsEnrolled,
            courseData.isArchived,
          ]
        );
      }
      console.log('Test courses seeded.');

      await client.query(
        `INSERT INTO user_purchased_courses (user_id, course_id) VALUES
         ($1, $2), ($1, $3);`,
        [studentId, courseAiId, courseWebDevId]
      );
      console.log('Student purchased test courses.');

    } catch (error) {
      console.error('Error during seeding:', error);
      throw error;
    } finally {
      client.release();
    }
  },
};
