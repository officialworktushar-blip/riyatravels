ALTER TABLE app_settings ADD COLUMN hero_image_url text;
ALTER TABLE app_settings ADD COLUMN hero_heading text;
ALTER TABLE app_settings ADD COLUMN hero_subheading text;

CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active testimonials" ON testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to testimonials" ON testimonials
  FOR ALL USING (true) WITH CHECK (true);
