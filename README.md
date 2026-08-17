# KataBox

A personal, single-user multi-language vocabulary trainer with flashcards and SM-2 spaced repetition. Built with React + Vite, backed directly by Supabase (Postgres + Auth), deployed to Vercel.

## Stack

- **Frontend**: React 18 + Vite, Tailwind CSS (mobile-first, responsive)
- **Backend**: Supabase (Postgres, auth, row-level security) — called directly from the frontend, no separate server
- **Export**: `exceljs`, generated client-side
- **Hosting**: Vercel

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is plenty for one user).
2. Open **SQL Editor** → **New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates all tables (`languages`, `tags`, `vocab`, `synonyms`, `vocab_tags`, `review_stats`, `review_log`), triggers, and row-level security policies scoped to `auth.uid()`.
3. In **Authentication → Providers**, make sure **Email** is enabled.
4. In **Authentication → Users**, click **Add user** and create your own login (email + password). This app has no public sign-up — you create your one account by hand.
5. In **Project Settings → API**, copy the **Project URL** and **anon public** key — you'll need them next.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open the printed URL, sign in with the account you created in Supabase Auth, and add a language in **Settings** to get started.

## 4. Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In Vercel, **Add New → Project**, import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel usually detects this automatically).
4. Add the same two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in **Project Settings → Environment Variables**.
5. Deploy. Open the URL on your phone and sign in — add it to your home screen for an app-like feel.

## Data model

| Table | Purpose |
|---|---|
| `languages` | User-defined languages (name + accent color), selectable everywhere |
| `tags` | Shared, free-text tags with case-insensitive uniqueness |
| `vocab` | Words/phrases: language, word, part of speech, meaning, example sentence |
| `synonyms` | Multiple synonyms per word |
| `vocab_tags` | Many-to-many join between `vocab` and `tags` |
| `review_stats` | SM-2 state per word: ease factor, interval, repetitions, next review date |
| `review_log` | One row per graded review — powers the streak and 30-day activity chart |

All tables are protected by row-level security scoped to the signed-in user, so the anon key is safe to ship to the browser.

## Features

- **Language management** — add languages anytime from Settings; each gets an auto-assigned accent color.
- **Vocab CRUD** — word, part of speech, meaning, synonyms (chips), example sentence, tags (autocomplete against the shared `tags` table, reusing existing tags instead of duplicating).
- **Search** — one bar matches word, meaning (word-by-word), and tags, with live search-engine-style suggestions.
- **Filters** — language, tag (multi-select), part of speech; combine with each other and the search bar.
- **Review mode** — flippable flashcards, SM-2 scheduling (ease factor, interval, repetitions), grade with Again/Hard/Good/Easy, pick which language(s) to review.
- **Stats dashboard** — words per language, due today/this week, mastered count (21+ day interval), review streak, 30-day activity chart.
- **Excel export** — one workbook, one sheet per language, sorted A-Z, bold+frozen header row, filename dated like `katabox-backup-2026-08-17.xlsx`.

## Project structure

```
src/
  components/   Reusable UI (forms, pills, cards, sheets, flashcard)
  pages/        One file per tab (Card Box, Add Word, Review, Stats, Settings, Login)
  hooks/        Supabase-backed data hooks (languages, tags, vocab, review log)
  lib/          Pure logic: SM-2 scheduling, search/filter matching, stats math, Excel export
  contexts/     Auth context (Supabase session)
supabase/
  schema.sql    Full DDL + RLS policies — run once in the Supabase SQL editor
```
