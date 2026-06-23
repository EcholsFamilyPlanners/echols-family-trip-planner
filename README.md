# Anthony & Stephanie Travel Planner V2.2 Supabase Sync

This version adds Supabase-ready shared syncing.

## What syncs after login
- Favorites
- Trip status
- Ideas
- Restaurant notes
- Memories
- Packing notes
- Custom trips

## Required Supabase SQL
Run this file in Supabase SQL Editor:

```text
supabase/v2_2_shared_sync.sql
```

## Required Netlify environment variables
In Netlify:

Site configuration → Environment variables → Add variables

```text
VITE_SUPABASE_URL=your Supabase Project URL
VITE_SUPABASE_ANON_KEY=your Supabase anon/public key
```

Then redeploy the site.

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

## Notes
This app uses magic-link email sign in. Anyone who can sign in to your Supabase project and access the site can use the shared planner. For the next version, we can add stricter invite-only household membership.
