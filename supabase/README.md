# Supabase for StudyGo

This folder prepares a protected shared content system for the website. It is deliberately not connected to the demo yet: no project URL, key, password or personal data is stored in the repository.

## What the schema creates

- `institutions` and `institution_media` — catalogue cards and their licensed media;
- `student_passports` and `student_documents` — private data for a future student account;
- `consultation_requests` — requests from the consultation form;
- `profiles` — staff/student roles.

Every table has Row Level Security enabled. The catalogue is readable publicly, a student sees only their own passport/documents, and only an authenticated `admin` can edit catalogue data or view requests.

## Setup

Choose **one** path; do not run both files on the same project.

### Current StudyGo project (already has a catalogue)

The connected `studygo` project already contains 167 institution records. Keep them intact and run only `migrations/20260802_studygo_admin_portal.sql` in **SQL Editor**. It is additive: it adds the editor media table, Passport tables, consultation requests, safe admin policies and the profile-creation trigger without deleting or replacing existing catalogue tables.

### New empty project

1. Create a new Supabase project.
2. In **SQL Editor**, paste and run `schema.sql`.
3. Create the first team member under **Authentication → Users**. The trigger creates the corresponding `profiles` row automatically.
4. Run the final commented `update public.profiles…` line with that user UUID to make this person an admin.
5. In Vercel, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only for the server-side consultation function. Never place a service role key in browser JavaScript or in Git.
6. To make the editor page actually publish cards, replace its local draft adapter in `assets/js/portal.js` with authenticated requests using the Supabase browser client and a publishable key. The RLS policies will reject writes by non-admin users.

## Important launch checks

- Use an official source and `source_checked_at` for every programme/price/deadline.
- Save an attribution or permission note for every image in `institution_media`.
- Add consent, privacy policy and a real access process before collecting student documents.
- Keep `institution-media` private unless a media item is intentionally made public through a signed URL or a separate public cover asset.
