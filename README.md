# Riya Travels 🛵 🏍️ 🚗

A full-stack vehicle rental booking website for scooters, bikes, and cars. Built with **Next.js (App Router)** + **Tailwind CSS** on the frontend, and **Supabase** (Postgres + Storage + Auth) on the backend.

- **Public site** — no customer login/signup. Browse vehicles, pick a time, upload a license, pay via UPI, submit.
- **Admin panel** — email/password login via Supabase Auth. Manage vehicles, bookings, availability, and settings.

---

## Tech Stack

| Layer      | Tech                                             |
| ---------- | ------------------------------------------------ |
| Framework  | Next.js 14 (App Router) + TypeScript             |
| Styling    | Tailwind CSS (brand: navy `#16233F` / gold `#C99A4A`) |
| Backend    | Supabase (Postgres, Storage, Auth)               |
| Email      | Resend                                           |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Riya Travels <no-reply@yourdomain.com>
```

> ⚠️ **Security**: `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-only. They are never exposed to the browser. Public code only ever reads the `occupied_slots` view — never the `bookings` table directly (its public select is disabled by RLS).

---

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Create your first admin user

Admin accounts are created manually in Supabase Auth (there is **no public sign-up page**):

- Supabase Dashboard → **Authentication → Users → Add user**
- Add an email + password.
- Log in at `/admin/login`.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Public homepage (hero + vehicle grid)
│   ├── booking/[vehicleId]/      # Multi-step public booking flow
│   ├── admin/
│   │   ├── layout.tsx            # Admin shell (sidebar + auth)
│   │   ├── login/                # Supabase email/password login
│   │   ├── dashboard/            # Bookings list (status + type filters)
│   │   ├── bookings/[id]/        # Booking detail (approve/reject/cancel + docs)
│   │   ├── vehicles/             # Full vehicle CRUD (scooty/bike/car)
│   │   ├── availability/         # Timeline of bookings + blocked slots
│   │   └── settings/             # Edit UPI ID + QR scanner image
│   └── api/
│       ├── upload/               # Server upload helper
│       ├── signed-url/           # Short-lived signed URLs for private docs
│       └── send-confirmation/    # Resend confirmation email on approve
├── components/
│   ├── public/                   # Navbar, vehicle grid/card
│   └── booking/                  # TimeSlot / Details / License / Payment / Review
├── lib/
│   ├── supabase/                 # client.ts, server.ts, admin.ts
│   ├── types.ts                  # Shared TS types + constants
│   └── utils.ts                  # Formatting, date, image, validation helpers
└── middleware.ts                 # Protects /admin/* routes
```

---

## The Time-Slot Conflict System

This is the heart of the "no double-booking" guarantee. It works in **two complementary layers**:

### 1. Database exclusion constraint (the real guarantee)

The `bookings` table has a **DB-level exclusion constraint** preventing overlapping time ranges for the same `vehicle_id` when the status is `pending_review` or `approved`. The public-readable view `occupied_slots` unions active bookings + `blocked_slots`.

> The UI is real-time friendly, but **the database is the source of truth** — even if two people submit simultaneously, Postgres will reject the second overlapping insert.

### 2. Graceful UI handling (Postgres error `23P01`)

Postgres raises error code **`23P01`** (exclusion constraint violation) when an overlapping booking/block is inserted. The public booking flow catches this and:

1. Shows the message: _"Sorry, that time slot was just booked. Please choose another time."_
2. Redirects back to **Step 1 (Time Slot)**.
3. **Refetches `occupied_slots`** so the now-conflicting time is greyed out.

The same `23P01` handling is applied in the **admin Availability** page when adding a `blocked_slots` entry that overlaps an existing booking/block.

### How the picker helps

On the public Time Slot step:

- It queries `occupied_slots` for the selected vehicle.
- It greys out / disables start times that fall inside an occupied range.
- It refetches occupied slots when the selected date changes.
- It live-computes the total: `rate_per_day` when duration ≥ 24h, else `rate_per_hour × hours`.

Because the DB constraint is the real guarantee, the picker's blocking is purely a convenience — a submit-time conflict is still handled gracefully via `23P01`.

---

## Booking Flow (Public — no signup)

1. **Time Slot** — pick date + start time + duration (2h/4h/6h/12h/1 day or custom). Occupied times grey out. Live total + breakdown shown.
2. **Details** — name, validated email, validated WhatsApp phone. Includes a hidden **honeypot** field for spam protection (ungated form).
3. **License** — upload front + back of driving license. Images are client-side resized/compressed before upload.
4. **Payment** — shows the UPI ID (copy button) + QR scanner image from `app_settings`, then upload a payment screenshot.
5. **Review & Submit** — uploads files to the private `licenses` and `payment-proofs` buckets with randomized UUID filenames (no PII in paths), inserts a `bookings` row with status `pending_review`, and shows a success message.

On submit-time conflict (`23P01`) the user is returned to Step 1 with the friendly message above.

---

## Admin Panel

- `/admin/login` — Supabase Auth email/password (no public signup).
- `/admin/dashboard` — bookings list. Filter by status **and** vehicle type.
- `/admin/bookings/[id]` — full customer + vehicle info, time slot, amount, and the driving license front/back + payment screenshot rendered via **short-lived server-generated signed URLs** (private buckets, never public). Approve / Reject (optional note) / Cancel (for approved bookings, which frees the slot). **Approve** calls `/api/send-confirmation` to email the customer.
- `/admin/vehicles` — single CRUD screen for scooters, bikes, and cars (type filter tab, image upload, rates, capacity, active toggle).
- `/admin/availability` — pick any vehicle (searchable/filterable by type), see a timeline of its bookings (colored by status) and blocked slots, and add/delete blocks with `23P01` overlap handling.
- `/admin/settings` — edit the UPI ID and upload/replace the QR scanner image.

All `/admin/*` routes (except `/admin/login`) are protected by `src/middleware.ts`, which checks the Supabase session and redirects to `/admin/login` if absent.

---

## Security Notes

- Service-role key and Resend key are **server-side only**.
- `licenses` and `payment-proofs` are **private** buckets; served only via short-lived signed URLs generated server-side for admin views.
- Public code only reads the `occupied_slots` **view** for availability — never the `bookings` table (public select disabled by RLS).
- All form inputs are validated client-side (and the insert is sanitized server-side by Supabase RLS).
- The public booking form includes a **honeypot** field as basic spam protection.
- License/payment paths use **randomized UUIDs** with no customer PII.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import Project** and connect the repo.
3. Add all environment variables from `.env.example` to the project settings.
4. Deploy.

> Make sure your Supabase project has the schema (tables, `occupied_slots` view, exclusion constraint), private buckets with the right RLS, and at least one admin Auth user created before going live.
