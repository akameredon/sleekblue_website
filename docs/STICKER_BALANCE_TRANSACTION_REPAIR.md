# Sticker Balance: transaction integrity repair

Date: 2026-10-12

## Confirmed defect

The customer portal's status function and the database snapshot compared `reorder_level`
before `warning_level`. When a legacy customer's values are reversed, the status can stay
at "reorder" and the warning band becomes unreachable. The token usage RPC also inserted an
alert on every use while the balance stayed below a threshold, while the authenticated staff
usage RPC did not create corresponding low-stock alerts.

## Repair prepared

Migration `supabase/migrations/202610120001_sticker_balance_alert_integrity.sql` introduces a
shared threshold-crossing helper used by both usage RPCs and normalizes threshold ordering in
the customer snapshot. The frontend status indicator applies the same normalization. The helper
is not executable by anon/authenticated roles directly; it is called by the existing SECURITY
DEFINER transaction functions.

This migration does not change customer records, delivered/used quantities, existing alerts,
or configured thresholds. It changes alert behavior only for new usage transactions after rollout.

## Deployment status

- Prepared in branch `audit/sticker-balance-foundation`.
- Not applied to the live Supabase project.
- Must pass the staging validation checklist in `docs/STICKER_BALANCE_REPAIR_VALIDATION.md`.
- Live Supabase currently has no rows in `customer_access_tokens`; token-link flow therefore needs
  a real browser smoke test with a newly generated token before enabling customer use.
- Existing schema generations remain in place pending an explicit data-path migration plan.
