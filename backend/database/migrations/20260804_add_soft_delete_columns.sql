-- Run once after database/remaining_schema.sql.
-- Adds reversible soft-delete metadata for API-managed directory records.

ALTER TABLE categories
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at,
  ADD COLUMN deleted_by BIGINT UNSIGNED NULL AFTER deleted_at,
  ADD INDEX idx_categories_deleted_at (deleted_at);

ALTER TABLE systems
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at,
  ADD COLUMN deleted_by BIGINT UNSIGNED NULL AFTER deleted_at,
  ADD INDEX idx_systems_deleted_at (deleted_at);
