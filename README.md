# FarmConnect Marketplace

FarmConnect Marketplace is a full-stack Express, MongoDB, HTML, CSS, and JavaScript application that helps farmers sell fresh produce directly to restaurants, resorts, hotels, caterers, supermarkets, exporters, and other bulk buyers.

## Features

- JWT authentication with bcrypt password hashing and role-based access control.
- Farmer, buyer, and admin profiles.
- Produce listings with availability, quantity, pricing, harvest dates, delivery options, certifications, photos, and stock status.
- Faceted produce search by category, location, price range, quantity, harvest date, delivery, certification status, farmer rating, and minimum order quantity.
- Order workflow with pending, accepted, counter-offered, rejected, preparing, ready for pickup, out for delivery, delivered, completed, and cancelled statuses.
- Traceability fields on every order for one-step-back and one-step-forward produce tracking.
- Recurring supply requests for weekly or monthly standing orders.
- Messaging, ratings, notifications, certifications, and admin verification workflows.
- Mobile-first agriculture-themed frontend.

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## REST API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/listings`
- `POST /api/listings` farmer only
- `GET /api/listings/:id`
- `POST /api/orders` buyer only
- `PATCH /api/orders/:id/status` farmer/admin order updates
- `GET /api/orders/my`
- `POST /api/messages`
- `GET /api/messages/conversations/:userId`
- `GET /api/admin/analytics` admin only

## Security Notes

Use HTTPS, authenticated MongoDB users with least privilege, strong environment secrets, production logging/monitoring, and a reverse proxy for production deployments.
