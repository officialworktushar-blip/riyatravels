# Riya Travels

A full-stack vehicle rental booking website for scooters, bikes, and cars. Built with **Next.js (App Router)** + **Tailwind CSS** on the frontend, and **Supabase** (Postgres + Storage + Auth) on the backend.

- **Public site** — no customer login/signup. Browse vehicles, pick a time, upload a license, pay via UPI, submit.
- **Admin panel** — email/password login via Supabase Auth. Manage vehicles, bookings, availability, settings, and testimonials.

---

## Tech Stack

| Layer      | Tech                                             |
| ---------- | ------------------------------------------------ |
| Framework  | Next.js 14 (App Router) + TypeScript             |
| Styling    | Tailwind CSS (brand: navy `#16233F` / gold `#C99A4A`) |
| Backend    | Supabase (Postgres, Storage, Auth)               |
| Email      | Nodemailer (Gmail SMTP)                          |
| Images     | next/image + Webp compression via Canvas API     |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password   # Google Account → Security → 2-Step Verification → App Passwords
```

> **Security**: `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` are server-only. They are never exposed to the browser. Public code only ever reads the `occupied_slots` view — never the `bookings` table directly (its public select is disabled by RLS).

---

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database setup

Run the migration in `supabase/migrations/001_hero_testimonials.sql` against your Supabase project (via the SQL Editor in the Supabase Dashboard). This adds:

- `hero_image_url` column to the `app_settings` table.
- A new `testimonials` table with RLS (public can read active testimonials; admin has full access).

You also need to create a **`site-content`** storage bucket (public) for the hero image. The existing `vehicle-images` and `scanner-qr` buckets should already be public.

### Create your first admin user

Admin accounts are created manually in Supabase Auth (there is **no public sign-up page**):

- Supabase Dashboard → **Authentication → Users → Add user**
- Add an email + password.
- Log in at `/admin/login` (not linked from the public site — type the URL directly).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Public homepage (hero, fleet, how-it-works, testimonials, FAQ)
│   ├── about/page.tsx            # About page (story, values, why rent with us)
│   ├── contact/page.tsx          # Contact page (WhatsApp, email, map placeholder, hours)
│   ├── booking/[vehicleId]/      # Multi-step public booking flow
│   ├── admin/
│   │   ├── layout.tsx            # Admin shell (sidebar + auth, noindex meta tag)
│   │   ├── login/                # Supabase email/password login
│   │   ├── dashboard/            # Bookings list (status + type filters)
│   │   ├── bookings/[id]/        # Booking detail (approve/reject/cancel + docs)
│   │   ├── vehicles/             # Full vehicle CRUD (scooty/bike/car)
│   │   ├── availability/         # Timeline of bookings + blocked slots
│   │   ├── settings/             # UPI ID, QR scanner, homepage hero image/text
│   │   └── testimonials/         # Testimonial CRUD (name, rating, comment, active toggle)
│   └── api/
│       ├── upload/               # Server upload helper
│       ├── signed-url/           # Short-lived signed URLs for private docs
│       └── send-confirmation/    # Gmail SMTP confirmation email on approve
├── components/
│   ├── public/
│   │   ├── Navbar.tsx            # Sticky nav (no admin links; Home, Vehicles, About, Contact)
│   │   ├── VehicleCard.tsx       # Image + rates + Book Now (uses next/image)
│   │   ├── VehicleGrid.tsx       # Filter pills + responsive grid
│   │   ├── HowItWorks.tsx        # 4-step visual guide
│   │   ├── WhyChoose.tsx         # Feature grid (4 benefits)
│   │   ├── Testimonials.tsx      # Star-rated customer quotes
│   │   ├── FAQ.tsx               # Accordion with 6 common questions
│   │   └── Footer.tsx            # Brand footer with contact + social placeholders
│   └── booking/                  # TimeSlot / Details / License / Payment / Review
├── lib/
│   ├── supabase/                 # client.ts, server.ts, admin.ts
│   ├── types.ts                  # Shared TS types + constants
│   └── utils.ts                  # Formatting, date, image compression (webp), validation helpers
├── middleware.ts                 # Protects /admin/* routes
supabase/
└── migrations/
    └── 001_hero_testimonials.sql # app_settings hero columns + testimonials table + RLS
public/
└── robots.txt                   # Disallows crawling of /admin/*
```

---

## Public Pages

| Page | Route | Content |
|------|-------|---------|
| Home | `/` | Hero (admin-manageable heading/subheading/image), Our Fleet, How It Works, Why Choose, Testimonials, FAQ |
| About | `/about` | Story, mission/values cards, why rent with us, CTA to fleet & contact |
| Contact | `/contact` | WhatsApp button (wa.me), email, address placeholder, embedded map placeholder, business hours, FAQ prompt |

### Public Homepage Sections

1. **Hero** — Admin-manageable heading, subheading, and background image. Rendered as a full-bleed landscape banner (responsive `min-h` heights for mobile/desktop) with `next/image` `fill` + `object-cover`, plus a navy overlay + gradient for text readability.
2. **Our Fleet** — Vehicle grid with type filter pills and Book Now cards.
3. **How It Works** — 4-step visual: Choose Ride → Upload License → Pay via UPI → Get Confirmed.
4. **Why Choose Riya Travels** — 4-column feature grid (Wide Fleet, Easy UPI, Quick Verification, WhatsApp Support).
5. **Testimonials** — Star-rated customer quotes (admin-managed, stored in `testimonials` table).
6. **FAQ** — Accordion with 6 common questions and answers (`#faq` anchor).

---

## The Time-Slot Conflict System

This is the heart of the "no double-booking" guarantee. It works in **two complementary layers**:

### 1. Database exclusion constraint (the real guarantee)

The `bookings` table has a **DB-level exclusion constraint** preventing overlapping time ranges for the same `vehicle_id` when the status is `pending_review` or `approved`. The public-readable view `occupied_slots` unions active bookings + `blocked_slots`.

### 2. Graceful UI handling (Postgres error `23P01`)

Postgres raises error code **`23P01`** (exclusion constraint violation) when an overlapping booking/block is inserted. The public booking flow catches this and shows a friendly message, redirects back to Step 1, and refetches occupied slots.

---

## Booking Flow (Public — no signup)

1. **Time Slot** — pick date + start time + duration. Occupied times grey out. Live total + breakdown shown.
2. **Details** — name, validated email, validated WhatsApp phone. Includes a hidden **honeypot** field for spam protection.
3. **License** — upload front + back of driving license. Images are client-side compressed and converted to WebP before upload.
4. **Payment** — shows the UPI ID (copy button) + QR scanner image from `app_settings`, then upload a payment screenshot.
5. **Review & Submit** — uploads files to private storage buckets with randomized UUID filenames, inserts a `bookings` row with status `pending_review`.

---

## Admin Panel

- `/admin/login` — Supabase Auth email/password (not linked from the public site; `<meta name="robots" content="noindex, nofollow">` on all admin pages; `robots.txt` disallows `/admin/`).
- `/admin/dashboard` — bookings list. Filter by status **and** vehicle type.
- `/admin/bookings/[id]` — full customer + vehicle info, time slot, amount, documents via signed URLs. Approve / Reject / Cancel.
- `/admin/vehicles` — CRUD for scooters, bikes, and cars (image upload auto-converted to WebP).
- `/admin/availability` — timeline of bookings + blocked slots with `23P01` overlap handling.
- `/admin/settings` — edit UPI ID, QR scanner image, and homepage hero (heading, subheading, background image).
- `/admin/testimonials` — add/edit/delete/toggle customer testimonials (name, star rating, comment).

All `/admin/*` routes (except `/admin/login`) are protected by `src/middleware.ts`, which checks the Supabase session and redirects to `/admin/login` if absent. Supabase Auth provides built-in brute-force protection on the login endpoint.

---

## Database Schema (Supabase)

### Tables

| Table | Key columns | Notes |
|-------|-------------|-------|
| `vehicles` | id, type, name, image_url, rate_per_hour, rate_per_day, is_active | Public read via RLS |
| `bookings` | id, customer_*, vehicle_id, start/end_time, amount, status, admin_note | Public insert only; admin manages status |
| `blocked_slots` | id, vehicle_id, start/end_time, reason | Admin only |
| `app_settings` | id=1 (single row), upi_id, scanner_image_url, hero_image_url | Admin-managed |
| `testimonials` | id, customer_name, rating (1-5), comment, is_active, created_at | Public read (active only); admin full access |

### Views

- `occupied_slots` — unions active bookings + blocked_slots (public read for the time-slot picker).

### Exclusion constraint

- Prevents overlapping bookings/blocks for the same vehicle when status is `pending_review` or `approved`.

---

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `vehicle-images` | Public | Vehicle photos |
| `scanner-qr` | Public | UPI QR code |
| `site-content` | Public | Hero image |
| `licenses` | Private | Driving license uploads (served via signed URLs) |
| `payment-proofs` | Private | Payment screenshots (served via signed URLs) |

All uploaded images are compressed and converted to WebP format for smaller file sizes.

---

## Security Notes

- Service-role key and Gmail credentials are **server-side only**.
- `/admin/*` is **not linked** from the public site, has `<meta name="robots" content="noindex, nofollow">`, and is disallowed in `robots.txt`. It is still reachable by direct URL but protected by Supabase Auth login.
- `licenses` and `payment-proofs` are **private** buckets; served only via short-lived signed URLs.
- Public code only reads the `occupied_slots` **view** — never the `bookings` table directly (RLS).
- All form inputs are validated client-side; the insert is sanitized server-side by Supabase RLS.
- The public booking form includes a **honeypot** field as basic spam protection.
- License/payment paths use **randomized UUIDs** with no customer PII.
- Images uploaded through admin (vehicles, hero) are compressed and converted to WebP before storage.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import Project** and connect the repo.
3. Add all environment variables from `.env.example` to the project settings.
4. Deploy.

> Make sure your Supabase project has the schema (tables, views, exclusion constraint, RLS), the `site-content` public bucket, private buckets with the right RLS, and at least one admin Auth user created before going live.
