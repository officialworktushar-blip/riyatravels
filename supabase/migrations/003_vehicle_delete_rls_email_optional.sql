-- Allow admin to delete vehicles (RLS policy)
CREATE POLICY "Admin full access to vehicles" ON vehicles
  FOR ALL USING (true) WITH CHECK (true);

-- Make customer_email optional in bookings table
ALTER TABLE bookings ALTER COLUMN customer_email DROP NOT NULL;

-- Permanently delete related rows when a vehicle is deleted (no leftovers)
ALTER TABLE blocked_slots DROP CONSTRAINT IF EXISTS blocked_slots_vehicle_id_fkey;
ALTER TABLE blocked_slots
  ADD CONSTRAINT blocked_slots_vehicle_id_fkey
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_vehicle_id_fkey;
ALTER TABLE bookings
  ADD CONSTRAINT bookings_vehicle_id_fkey
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
