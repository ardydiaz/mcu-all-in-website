-- Add category groups for hierarchical tab-based organization

USE mcu_all_in_one;

CREATE TABLE IF NOT EXISTS category_groups (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(170) NOT NULL,
  description VARCHAR(500) NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_category_groups_name (name),
  UNIQUE KEY uq_category_groups_slug (slug),
  INDEX idx_category_groups_status_order (status, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add group reference and is_tab flag to categories
ALTER TABLE categories
  ADD COLUMN category_group_id BIGINT UNSIGNED NULL AFTER id,
  ADD COLUMN is_tab BOOLEAN NOT NULL DEFAULT FALSE AFTER category_group_id,
  ADD CONSTRAINT fk_categories_group
    FOREIGN KEY (category_group_id)
    REFERENCES category_groups(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

-- Create the three groups
INSERT INTO category_groups (name, slug, description, display_order, status)
VALUES
  ('Student Faculty', 'student-faculty', 'Services for students and faculty members', 1, 'active'),
  ('Administrator', 'administrator', 'Administrative and management systems', 2, 'active'),
  ('External Affairs', 'external-affairs', 'Alumni and community-facing services', 3, 'active')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  display_order = VALUES(display_order);

-- Assign existing categories to groups (mark them as group-level, not tabs)
UPDATE categories SET
  category_group_id = (SELECT id FROM category_groups WHERE slug = 'student-faculty'),
  is_tab = FALSE
WHERE name = 'Student Faculty';

UPDATE categories SET
  category_group_id = (SELECT id FROM category_groups WHERE slug = 'administrator'),
  is_tab = FALSE
WHERE name = 'Administrator';

UPDATE categories SET
  category_group_id = (SELECT id FROM category_groups WHERE slug = 'external-affairs'),
  is_tab = FALSE
WHERE name = 'External Affairs';

-- Create tab-level sub-categories under Student Faculty
INSERT INTO categories (category_group_id, name, slug, description, display_order, is_tab, status)
SELECT
  (SELECT id FROM category_groups WHERE slug = 'student-faculty'),
  'Student',
  CONCAT('student-', UNIX_TIMESTAMP()),
  'Student resources and portals',
  1,
  TRUE,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE is_tab = TRUE AND name = 'Student');

INSERT INTO categories (category_group_id, name, slug, description, display_order, is_tab, status)
SELECT
  (SELECT id FROM category_groups WHERE slug = 'student-faculty'),
  'Faculty',
  CONCAT('faculty-', UNIX_TIMESTAMP()),
  'Faculty resources and platforms',
  2,
  TRUE,
  'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE is_tab = TRUE AND name = 'Faculty');
