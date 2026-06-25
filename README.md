# Anthony & Stephanie Travel OS V4.1

## V4.1 Voting System

Adds per-person voting on every trip so the Together page can surface trips you both love.

### New in V4.1

- **Vote buttons on every Trip Detail page** — ❤️ Love / 👍 Like / 🤔 Maybe / 👋 Pass
- **Vote indicator on Trip Library cards** — small emoji shows your current vote at a glance
- **Together page — Trips You Both Love** — highlighted section at the top showing trips where both Anthony and Stephanie voted Love or Like
- **Vote summary in person panels** — each person's panel shows a Love/Like/Maybe/Pass count
- **Vote emoji in planning queue** — each trip in the shared queue shows how each person voted

### New Supabase migration to run

Run this in Supabase SQL Editor **before deploying**:

```
supabase/migrations/008_trip_votes.sql
```

### Previous migrations (already done)
1. 001_travel_os_core.sql
2. 002_seed_packing_templates.sql
3. 003_trip_notebook_fields.sql
4. 004_personal_wishlist_notes.sql
5. 005_couples_planner_functionality.sql
6. 006_trip_decision_tools.sql
7. 007_people_household_foundation.sql

## Netlify build settings

Build command: `npm run build`
Publish directory: `dist`

## Environment variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```
