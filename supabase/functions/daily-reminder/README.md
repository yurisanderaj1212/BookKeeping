# daily-reminder — Edge Function

Sends a daily in-app notification + email reminder to all active users.

## Deploy

```bash
supabase functions deploy daily-reminder --no-verify-jwt
```

## Schedule (Supabase Dashboard)

Dashboard → Edge Functions → daily-reminder → Schedules → New schedule:
- Cron: `0 18 * * *`  (6 PM UTC = 1 PM EST / 12 PM CST)
- Adjust to match your users' timezone

## Environment Variables

Set in Dashboard → Settings → Edge Functions → Secrets:

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | API key from resend.com (free: 3000 emails/month) |
| `APP_URL` | Your production URL, e.g. `https://chillnumbers.com` |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected.

## Email provider

Uses [Resend](https://resend.com) — free tier covers 3,000 emails/month.
If `RESEND_API_KEY` is not set, only in-app notifications are sent (no crash).
