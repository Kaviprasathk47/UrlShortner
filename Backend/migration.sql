-- Migration for existing url_shortener databases.
-- Safe to re-run: skips click_count if the column already exists.

USE url_shortener;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'url'
    AND COLUMN_NAME = 'click_count'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE url ADD COLUMN click_count INT NOT NULL DEFAULT 0',
  'SELECT ''click_count already exists'' AS migration_status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
