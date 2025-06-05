-- db/init-db.sql

-- Включение расширения pgcrypto для gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Создание ENUM типов
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE access_token_entity_type AS ENUM ('course_access', 'platform_tier_access');
CREATE TYPE access_token_status AS ENUM ('pending', 'active', 'expired', 'revoked');
CREATE TYPE platform_access_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');

-- Создание таблицы users
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'student',
    platform_access_tier platform_access_tier NOT NULL DEFAULT 'free',
    student_slots_available INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE, -- Добавлено для Magic Link
    hashed_password TEXT -- Опционально, если будете использовать пароли в будущем
);

-- Создание функции для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для таблицы users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Создание таблицы courses
CREATE TABLE courses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL, -- Используем NUMERIC для валюты
    instructor_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    image_url TEXT, -- Добавлено, если курсы имеют изображения
    currency TEXT NOT NULL DEFAULT 'RUB', -- Добавлено
    category TEXT NOT NULL DEFAULT 'other', -- Добавлено
    is_published BOOLEAN NOT NULL DEFAULT FALSE, -- Добавлено
    students_enrolled INTEGER NOT NULL DEFAULT 0, -- Добавлено
    is_archived BOOLEAN NOT NULL DEFAULT FALSE, -- Добавлено
    rating NUMERIC(2,1), -- Добавлено
    reviews_count INTEGER, -- Добавлено
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание триггера для таблицы courses
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Создание таблицы access_tokens
CREATE TABLE access_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    token TEXT NOT NULL UNIQUE, -- Уникальная строка токена
    user_id TEXT NOT NULL,
    entity_type access_token_entity_type NOT NULL,
    entity_id TEXT NOT NULL, -- ID курса или ID уровня доступа платформы
    access_details JSONB, -- Используем JSONB для гибкости
    status access_token_status NOT NULL DEFAULT 'pending',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    yookassa_payment_id TEXT UNIQUE, -- Убрано NOT NULL, т.к. может быть опциональным
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание триггера для таблицы access_tokens
CREATE TRIGGER update_access_tokens_updated_at
BEFORE UPDATE ON access_tokens
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Создание таблицы для связи многие-ко-многим между users и courses (купленные курсы)
-- Это связующая таблица для отношения UserPurchasedCourses
CREATE TABLE user_purchased_courses (
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, course_id), -- Составной первичный ключ
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- НОВАЯ ТАБЛИЦА: magic_link_tokens
CREATE TABLE magic_link_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    token TEXT NOT NULL UNIQUE, -- Сам токен, который отправляется по email
    user_id TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE, -- Когда токен был использован
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Начальные данные (Seeding)
-- Эти данные будут вставлены при первом запуске контейнера БД
INSERT INTO users (id, username, email, role, platform_access_tier, student_slots_available, email_verified) VALUES
('user123', 'user123', 'student@example.com', 'student', 'free', 0, TRUE),
('teacher456', 'teacher456', 'teacher@example.com', 'teacher', 'free', 0, TRUE),
('admin789', 'admin789', 'admin@example.com', 'admin', 'free', 0, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, title, description, instructor_id, price, currency, category, is_published, students_enrolled, is_archived) VALUES
('course-ai-basics', 'Основы ИИ', 'Курс по основам искусственного интеллекта.', 'teacher456', 99.99, 'RUB', 'programming', TRUE, 10, FALSE),
('course-web-dev', 'Fullstack Web-разработка', 'Полный курс по веб-разработке.', 'teacher456', 199.99, 'RUB', 'programming', TRUE, 50, FALSE),
('course-my-exclusive', 'Мой Эксклюзивный Курс', 'Курс от платформы.', 'admin789', 150.00, 'RUB', 'other', TRUE, 5, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_purchased_courses (user_id, course_id) VALUES
('user123', 'course-ai-basics'),
('user123', 'course-web-dev')
ON CONFLICT (user_id, course_id) DO NOTHING;
