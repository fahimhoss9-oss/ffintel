# Deploying FFIntel

Simple guide. Everything here uses free accounts.

## What you need first

1. A **GitHub** account (free) — stores the code.
2. A **Vercel** account (free) — puts the site online.
3. A **Supabase** account (free) — the database + login system.

## Step 1 — Put the code on GitHub

On your computer (or ask SKAR to do it):

```bash
cd ~/workspace/ff-platform
git init
git add .
git commit -m "FFIntel initial build"
# create an empty repo on github.com first, then:
git remote add origin https://github.com/YOURNAME/ffintel.git
git push -u origin main
```

## Step 2 — Create the Supabase project

1. Go to supabase.com → New project. Name it `ffintel`, pick a region near you.
2. When it's ready, open **Project Settings → Database** and copy the
   **Connection string** (the one labeled "URI"). It looks like:
   `postgresql://postgres:YOURPASSWORD@db.xxx.supabase.co:5432/postgres`
3. Open **Project Settings → API** and copy:
   - **Project URL** (starts with `https://...supabase.co`)
   - **anon public** key

## Step 3 — Create the database tables and add data

```bash
cd ~/workspace/ff-platform
export DATABASE_URL="paste-your-connection-string-here"
npx prisma migrate deploy
npx prisma db seed
```

`db seed` loads the researched Free Fire dataset (weapons, maps, characters,
tournaments, teams). Run it again any time — it's safe to re-run.

## Step 4 — Deploy on Vercel

1. Go to vercel.com → Add New → Project → import your GitHub repo.
2. Before clicking Deploy, open **Environment Variables** and add:
   - `DATABASE_URL` = your Supabase connection string
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `ADMIN_EMAILS` = your own email address (this makes you the admin)
3. Click Deploy. Vercel gives you a live URL like `ffintel.vercel.app`.

## Step 5 — Log in as admin

1. Open `your-site.vercel.app/login`.
2. Enter your email (the one in `ADMIN_EMAILS`). You'll get a magic link by email.
3. Click it — you're in the admin dashboard at `/admin`.

## What each setting does (plain language)

| Setting            | What it is                                              |
|--------------------|---------------------------------------------------------|
| `DATABASE_URL`     | Address of your database. Without it the site runs in demo mode with sample data. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Let the login system talk to Supabase. |
| `ADMIN_EMAILS`     | Email addresses allowed into `/admin`. Comma-separated if more than one. |

## Notes

- **Demo mode**: if `DATABASE_URL` is missing, the site still works and builds,
  showing clearly-labeled sample data.
- **Admin needs a database**: the admin dashboard shows a setup notice until
  the env vars above are configured.
- Map artwork is original schematic illustrations — no Garena assets are used.
