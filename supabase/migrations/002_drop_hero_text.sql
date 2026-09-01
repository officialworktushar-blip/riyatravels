-- Drop hero_heading and hero_subheading columns from app_settings.
-- Hero text fields are no longer used; the homepage hero now shows only the image.

ALTER TABLE app_settings DROP COLUMN IF EXISTS hero_heading;
ALTER TABLE app_settings DROP COLUMN IF EXISTS hero_subheading;