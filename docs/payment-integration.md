# Payment Integration

ZanMeal now has a provider-ready mobile money payment flow for:

- M-Pesa
- Airtel Money
- Tigo Pesa
- HaloPesa

## Current Implementation

The backend supports:

- Payment method validation.
- Tanzania phone number validation.
- Cash on delivery payment records.
- Payment initiation through a gateway service.
- Provider reference generation.
- Transaction records for initiation, callbacks, and manual updates.
- Mobile money callback endpoint.
- Duplicate callback tolerance for already-paid payments.
- Callback amount and phone-number checks.
- Paid, failed, pending, and processing status updates.
- Provider configuration status endpoint.
- Safe development mode using `PAYMENT_GATEWAY_MODE=mock`.

Endpoints:

- `POST /api/v1/payments`
- `GET /api/v1/payments/providers`
- `GET /api/v1/payments/{payment_id}`
- `PATCH /api/v1/payments/{payment_id}`
- `POST /api/v1/payments/callbacks/mobile-money`

## Development Mode

In `.env`:

```env
PAYMENT_GATEWAY_MODE=mock
PAYMENT_CALLBACK_SECRET=change-this-payment-callback-secret
```

Mock mode creates a realistic provider reference and waits for a callback or admin update. It does not move real money.

Cash payments can be recorded with:

```json
{
  "order_id": "ORDER_ID",
  "method": "Cash"
}
```

The backend returns `cod_pending` and does not require customer phone action.

## Production Credentials Needed

To process real money, add credentials from each provider or a payment aggregator:

```env
PAYMENT_GATEWAY_MODE=live
PAYMENT_LIVE_ADAPTER=aggregator
PAYMENT_AGGREGATOR_BASE_URL=
PAYMENT_AGGREGATOR_API_KEY=
PAYMENT_AGGREGATOR_API_SECRET=
PAYMENT_AGGREGATOR_MERCHANT_ID=
MPESA_API_KEY=
MPESA_API_SECRET=
AIRTEL_MONEY_CLIENT_ID=
AIRTEL_MONEY_CLIENT_SECRET=
TIGO_PESA_CLIENT_ID=
TIGO_PESA_CLIENT_SECRET=
HALOPESA_CLIENT_ID=
HALOPESA_CLIENT_SECRET=
```

The backend intentionally refuses to pretend live money was sent until the exact provider or aggregator API contract is implemented. Live production calls still require merchant onboarding, API credentials, callback URLs, provider-specific request signing, and callback payload mapping.

Recommended first production path:

1. Pick one aggregator that supports Tanzania mobile money.
2. Request sandbox credentials and documentation.
3. Configure the aggregator env values.
4. Add the provider-specific request signer and callback parser.
5. Keep `PAYMENT_GATEWAY_MODE=mock` until sandbox tests pass.
