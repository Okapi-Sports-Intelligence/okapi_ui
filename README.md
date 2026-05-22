This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Payment and Delivery Readiness

This app is safe for preview/test-mode deployment, but live checkout is
intentionally gated until production order persistence and export delivery are
ready.

Required Stripe/checkout variables:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
OKAPI_BASE_URL=https://okapidbs.okapisi.com
ORDER_STORE=file
EXPORT_DELIVERY_ENABLED=false
OKAPI_ENABLE_LIVE_CHECKOUT=false
```

Preview deployments should use Stripe test keys. If a live Stripe key is used,
checkout will refuse to create sessions unless all production gates are enabled:

```bash
ORDER_STORE=database
EXPORT_DELIVERY_ENABLED=true
OKAPI_ENABLE_LIVE_CHECKOUT=true
```

Those live gates should stay disabled until the app has a real database-backed
order store and paid orders can produce downloadable exports. The current
delivery endpoint confirms paid status and returns a pending delivery state
while product-to-export mapping is still being completed.
