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
- Payment initiation through a gateway service.
- Provider reference generation.
- Transaction records for initiation, callbacks, and manual updates.
- Mobile money callback endpoint.
- Paid, failed, pending, and processing status updates.
- Safe development mode using `PAYMENT_GATEWAY_MODE=mock`.

Endpoints:

- `POST /api/v1/payments`
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

## Production Credentials Needed

To process real money, add credentials from each provider or a payment aggregator:

```env
PAYMENT_GATEWAY_MODE=production
MPESA_API_KEY=
MPESA_API_SECRET=
AIRTEL_MONEY_CLIENT_ID=
AIRTEL_MONEY_CLIENT_SECRET=
TIGO_PESA_CLIENT_ID=
TIGO_PESA_CLIENT_SECRET=
HALOPESA_CLIENT_ID=
HALOPESA_CLIENT_SECRET=
```

The gateway service is ready for provider API calls, but live production calls require merchant onboarding, API credentials, callback URLs, and provider-specific request signing.
