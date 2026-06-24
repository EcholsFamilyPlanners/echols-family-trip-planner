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


## V3.1 Trip Notebook Update

Adds a richer trip detail page with tabs:
- Overview
- Plan
- Itinerary
- Food & Hotels
- Sports
- Packing
- Memories

New migration:
- `supabase/migrations/003_trip_notebook_fields.sql`


## V3.2 Personal Wish Lists

Adds:
- Wish Lists navigation section
- Personal wish list per signed-in user
- Personal trip notes
- Why I want to go
- Must-do list
- Personal rank and rating
- Wish-list checkbox on each trip page

New migration:
- `supabase/migrations/004_personal_wishlist_notes.sql`


## V3.3 Core Functionality

Focus:
- Together page
- Anthony and Stephanie wish lists side-by-side
- Trips both people want
- Shared planning queue
- Household member registration on sign-in
- Less decoration, more useful planning behavior

New migration:
- `supabase/migrations/005_couples_planner_functionality.sql`
