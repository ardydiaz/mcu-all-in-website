-- Allow one service to be assigned to multiple categories/tabs at once
-- (e.g. "Open Learning" visible under both Student and Faculty) without
-- creating a separate duplicate entry per tab.

USE mcu_all_in_one;

CREATE TABLE IF NOT EXISTS system_categories (
  system_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (system_id, category_id),

  CONSTRAINT fk_system_categories_system
    FOREIGN KEY (system_id) REFERENCES systems(id)
    ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT fk_system_categories_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backfill: every existing service keeps its current single category as
-- its first membership row. systems.category_id is kept afterwards as the
-- "primary" category for legacy joins (recent visits, analytics).
INSERT IGNORE INTO system_categories (system_id, category_id)
SELECT id, category_id FROM systems WHERE category_id IS NOT NULL;
