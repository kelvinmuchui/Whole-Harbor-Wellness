# Supabase test database

This migration and seed are for a **dedicated test project only**. Its row-level
security policies intentionally allow public clients to read and modify demo
records. Do not apply this migration to a production project or store real
customer data in this test database.

## Apply the schema and demo data

1. In the Supabase dashboard, open the SQL Editor for the test project.
2. Run [`migrations/20261121000000_whw_records.sql`](./migrations/20261121000000_whw_records.sql).
3. Then run [`seed.sql`](./seed.sql) to load the 50 demo records.
4. Restart the Vite app and verify the storefront and dashboards display the
   seeded records.
5. In the admin dashboard, add a formulation and partner; confirm each appears
   in the dashboard after saving. New customer signups are saved as user
   profiles, and partner-owner signups also create a partner application.

The seed is safe to re-run: it only updates existing demo rows and does not
overwrite live rows. After changing the app's demo data, regenerate it with
`npm run db:generate-seed` and run the resulting `seed.sql` again.

## App configuration

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.
Only use the publishable key in the browser; never put a Supabase secret or
service-role key in Vite environment variables.

Demo rows work without a Firebase session. Access to non-demo rows uses the
Firebase ID token, so configure Firebase as a third-party authentication
provider in Supabase before testing authenticated live data. The test migration
is not a production security policy; create and review production-specific RLS
policies before using real data.
