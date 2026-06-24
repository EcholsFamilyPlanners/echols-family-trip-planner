# Anthony & Stephanie Travel OS V3.0

This is the new long-term foundation for the shared travel platform.

## Included
- 47 trip ideas
- Shared trip status and notes
- Personal favorites
- Trip Library
- Trip Finder
- Budget estimator
- Packing Manager with templates
- Sports Venue Tracker with visited tracking
- Travel Journal
- Add custom trips
- Supabase-ready shared database structure
- Netlify-ready deployment

## Supabase setup

Run both migration files in Supabase SQL Editor, in this order:

1. `supabase/migrations/001_travel_os_core.sql`
2. `supabase/migrations/002_seed_packing_templates.sql`

## Netlify environment variables

Add these to Netlify:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Netlify build settings

Build command:

```bash
npm run build
```

Publish directory:

```text
dist
```

Base directory: leave blank.

## Important

V3 separates shared data and personal data:

Shared:
- trip status
- shared notes
- memories
- custom trips
- packing
- sports venue tracker

Personal:
- favorites
- personal ratings
- personal notes

V3.1 should tighten household membership policies after both Anthony and Stephanie are signed in.
