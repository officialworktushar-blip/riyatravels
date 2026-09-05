-- Add payment confirmation method to bookings.
-- Customers can either upload a payment screenshot, or send proof via WhatsApp.
-- NOTE: Run this manually in the Supabase SQL Editor (do not auto-run).

-- 1. Create the enum type (idempotent)
DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('screenshot', 'whatsapp');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add the column (nullable first so existing rows can be backfilled)
ALTER TABLE bookings ADD COLUMN payment_confirmation_method payment_method_type;

-- 3. payment_screenshot_url must be nullable — it will be empty/NULL when the
--    customer chose the WhatsApp option instead of uploading a screenshot.
ALTER TABLE bookings ALTER COLUMN payment_screenshot_url DROP NOT NULL;

-- 4. Backfill existing bookings as 'screenshot' (all current rows have a screenshot)
UPDATE bookings
SET payment_confirmation_method = 'screenshot'
WHERE payment_confirmation_method IS NULL;

-- 5. Enforce a value for all future inserts
ALTER TABLE bookings
  ALTER COLUMN payment_confirmation_method SET NOT NULL,
  ALTER COLUMN payment_confirmation_method SET DEFAULT 'screenshot';