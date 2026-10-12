# Sticker Balance repair validation checklist

This checklist accompanies migration `202610120001_sticker_balance_alert_integrity.sql`.
The migration is deliberately committed to source control first; do not apply it to the live
project until it has passed on a disposable/staging Supabase project with the same schema.

## Changes in this repair

- Both staff-authenticated and customer-token usage RPCs use one threshold-crossing alert helper.
- Alerts are emitted only when a usage transaction crosses a warning/reorder boundary, rather
  than on every usage record while a balance remains low.
- Thresholds are normalized with `LEAST`/`GREATEST` for status and alert decisions. Existing
  customer threshold values are not rewritten.
- The token snapshot retains its existing response shape and token hash/expiry/revocation checks.
- The UI status badge uses the same normalized threshold ordering.

## Required validation before live rollout

1. Apply the migration to a disposable Supabase project containing the current Sticker Balance schema.
2. Confirm migration completes and the five public RPC signatures remain unchanged.
3. Test positive usage; reject zero, negative, non-integer and over-balance usage.
4. Test two concurrent usage attempts against a balance that can cover only one; only one must succeed.
5. Test valid, expired, revoked, malformed, and cross-customer tokens. A token must reveal only its
   own customer's snapshot and must not permit an admin operation.
6. Test threshold crossings: above warning to between thresholds => one LOW_STOCK alert; above warning
   to at/below reorder => one REORDER alert; repeated use below a threshold => no repeated alert;
   delivery replenishment then crossing again => a new alert.
7. Test both reversed and correctly ordered legacy threshold values. Do not silently rewrite thresholds.
8. Confirm admin delivery still increments `current_delivered` and writes one delivery row atomically.
9. Reconcile each test customer's delivered total minus usage total with displayed remaining balance.
10. Test the customer portal, staff login, link creation/revocation, and password recovery in the browser.
11. Check RLS/function grants and run frontend build/CI before rollout.
12. After successful staging validation, apply the exact same migration to production and verify counts,
    balances, token records, and alert counts before and after.

## Explicitly not changed

- No live customer data or thresholds.
- No deletion of demo or legacy records.
- No retirement of the parallel product/movement/access-code schema.
- No alteration of token expiry policy or customer login flow.
- No production database migration is applied by this source-control commit.
