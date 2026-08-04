-- MCU All-in-One
-- Remaining application tables
--
-- Prerequisites:
--   1. The `mcu_all_in_one` database already exists.
--   2. The `users` table already exists with a BIGINT UNSIGNED `id` primary key.
--   3. The `roles` and `user_roles` tables already exist.
--
-- This script intentionally does not create or modify users, roles, or user_roles.

USE mcu_all_in_one;

-- ---------------------------------------------------------------------------
-- Departments
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(30) NULL,
  description VARCHAR(500) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_departments_name (name),
  UNIQUE KEY uq_departments_code (code),
  INDEX idx_departments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- System categories
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  color VARCHAR(30) NULL,
  icon VARCHAR(100) NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_categories_name (name),
  UNIQUE KEY uq_categories_slug (slug),
  INDEX idx_categories_status_order (status, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories
  (name, slug, description, color, icon, display_order, status)
VALUES
  ('University', 'university', 'Official university websites and information.', 'lime', 'landmark', 1, 'active'),
  ('Students', 'students', 'Student portals, admissions, and student services.', 'yellow', 'graduation-cap', 2, 'active'),
  ('Academics', 'academics', 'Learning, research, and academic platforms.', 'violet', 'book-open', 3, 'active'),
  ('Healthcare', 'healthcare', 'MCU Hospital and healthcare services.', 'red', 'heart-pulse', 4, 'active'),
  ('Corporate', 'corporate', 'Corporate information and career services.', 'orange', 'briefcase', 5, 'active'),
  ('Community', 'community', 'Alumni and community platforms.', 'pink', 'users', 6, 'active')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  color = VALUES(color),
  icon = VALUES(icon),
  display_order = VALUES(display_order);

-- ---------------------------------------------------------------------------
-- MCU systems and websites
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS systems (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(170) NOT NULL,
  description TEXT NULL,
  url VARCHAR(2048) NOT NULL,
  logo_path VARCHAR(500) NULL,
  color VARCHAR(30) NULL,
  status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_systems_slug (slug),
  INDEX idx_systems_category (category_id),
  INDEX idx_systems_status_order (status, display_order),
  INDEX idx_systems_featured (is_featured),
  INDEX idx_systems_created_by (created_by),
  INDEX idx_systems_updated_by (updated_by),

  CONSTRAINT fk_systems_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT fk_systems_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_systems_updated_by
    FOREIGN KEY (updated_by)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS announcements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500) NULL,
  image_path VARCHAR(500) NULL,
  link_url VARCHAR(2048) NULL,
  audience ENUM(
    'all',
    'students',
    'faculty',
    'administrators'
  ) NOT NULL DEFAULT 'all',
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  published_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_announcements_slug (slug),
  INDEX idx_announcements_status_dates (status, starts_at, ends_at),
  INDEX idx_announcements_audience (audience),
  INDEX idx_announcements_featured (is_featured),
  INDEX idx_announcements_created_by (created_by),

  CONSTRAINT fk_announcements_created_by
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_announcements_updated_by
    FOREIGN KEY (updated_by)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Uploaded-file metadata
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS uploads (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uploaded_by BIGINT UNSIGNED NULL,
  entity_type ENUM(
    'system',
    'announcement',
    'user',
    'department',
    'general'
  ) NOT NULL DEFAULT 'general',
  entity_id BIGINT UNSIGNED NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  public_url VARCHAR(2048) NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_extension VARCHAR(20) NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  alt_text VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_uploads_stored_name (stored_name),
  INDEX idx_uploads_entity (entity_type, entity_id),
  INDEX idx_uploads_uploaded_by (uploaded_by),
  INDEX idx_uploads_created_at (created_at),

  CONSTRAINT fk_uploads_uploaded_by
    FOREIGN KEY (uploaded_by)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Administrative audit trail
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id VARCHAR(100) NULL,
  description VARCHAR(500) NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_activity_user (user_id),
  INDEX idx_activity_action (action),
  INDEX idx_activity_entity (entity_type, entity_id),
  INDEX idx_activity_created_at (created_at),

  CONSTRAINT fk_activity_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- System visit analytics
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS system_visits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  system_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  session_id VARCHAR(100) NULL,
  referrer VARCHAR(2048) NULL,
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_visits_system_date (system_id, visited_at),
  INDEX idx_visits_user (user_id),
  INDEX idx_visits_session (session_id),
  INDEX idx_visits_date (visited_at),

  CONSTRAINT fk_visits_system
    FOREIGN KEY (system_id)
    REFERENCES systems(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_visits_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Daily analytics aggregates
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS system_daily_analytics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  system_id BIGINT UNSIGNED NOT NULL,
  analytics_date DATE NOT NULL,
  total_visits INT UNSIGNED NOT NULL DEFAULT 0,
  unique_visitors INT UNSIGNED NOT NULL DEFAULT 0,
  authenticated_visits INT UNSIGNED NOT NULL DEFAULT 0,
  anonymous_visits INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_daily_system_date (system_id, analytics_date),
  INDEX idx_daily_analytics_date (analytics_date),

  CONSTRAINT fk_daily_analytics_system
    FOREIGN KEY (system_id)
    REFERENCES systems(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
