-- Add minimum-order and extra-hour pricing fields to vehicles
ALTER TABLE vehicles
  ADD COLUMN min_hours integer NOT NULL DEFAULT 2,
  ADD COLUMN min_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN extra_rate_per_hour numeric;

-- Scooty: 2 hours minimum, Rs.200 prepaid, Rs.60/hr after 2 hours
UPDATE vehicles
SET min_hours = 2,
    min_amount = 200,
    extra_rate_per_hour = 60,
    rate_per_hour = 60
WHERE type = 'scooty';

-- Car: 12 hours minimum = Rs.1500, full day (24 hrs) = Rs.2000
UPDATE vehicles
SET min_hours = 12,
    min_amount = 1500,
    rate_per_day = 2000
WHERE type = 'car';