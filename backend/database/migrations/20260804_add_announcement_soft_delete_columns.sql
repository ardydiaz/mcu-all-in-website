-- Run once after database/remaining_schema.sql.
ALTER TABLE announcements
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at,
  ADD COLUMN deleted_by BIGINT UNSIGNED NULL AFTER deleted_at,
  ADD INDEX idx_announcements_deleted_at (deleted_at);
