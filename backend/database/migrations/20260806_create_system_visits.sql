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
    FOREIGN KEY (system_id) REFERENCES systems(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_visits_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
