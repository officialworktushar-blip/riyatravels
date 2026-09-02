-- Allow admin to delete vehicles (RLS policy)
CREATE POLICY "Admin full access to vehicles" ON vehicles
  FOR ALL USING (true) WITH CHECK (true);

-- Make customer_email optional in bookings table
ALTER TABLE bookings ALTER COLUMN customer_email DROP NOT NULL;
