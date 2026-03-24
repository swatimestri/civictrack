# Supabase Storage "policy blocks upload" fix

This app uploads issue images from the browser using `VITE_SUPABASE_ANON_KEY`.
Because of that, Supabase Storage needs explicit RLS policies for the `anon` role.

## 1) Confirm bucket name

- Bucket should exist in Supabase Storage as: `issue-images`
- `.env` should contain:

```env
VITE_SUPABASE_BUCKET=issue-images
```

## 2) Run SQL policies in Supabase

Open **Supabase Dashboard -> SQL Editor** and run:

```sql
-- Optional: create bucket if missing
insert into storage.buckets (id, name, public)
values ('issue-images', 'issue-images', true)
on conflict (id) do nothing;

-- Allow public (anon + authenticated) uploads into this bucket
create policy "issue_images_insert_anon"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'issue-images');

-- Allow public (anon + authenticated) read from this bucket
create policy "issue_images_select_anon"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'issue-images');
```

If these policies already exist, Supabase will show an error; that is fine.

## 3) Restart app

After `.env` changes, restart your frontend dev server.

## 4) Verify

1. Submit issue with image
2. Check Supabase Storage -> `issue-images` bucket
3. Confirm uploaded file appears under folder path `issue-images/...`

