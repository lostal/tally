# API Documentation

## Overview

Tally uses Next.js 15 API routes with Supabase as the backend. All API routes are located in `src/app/api/`.

## Authentication

### Proxy Protection

Routes under `/admin/*` and `/pos/*` are protected by `middleware.ts` using Supabase session validation.

### API Route Auth

API routes should validate authentication using `verifyApiAuth` from `@/lib/supabase/middleware`:

```typescript
import { verifyApiAuth } from '@/lib/supabase/middleware';

export async function POST(request: Request) {
  const { user, supabase, error } = await verifyApiAuth(request);
  if (!user) return unauthorized();
  // ... rest of handler
}
```

## Validation

All API routes should validate input using Zod schemas via `@/lib/api/validation`:

```typescript
import { validateBody, unauthorized, serverError } from '@/lib/api/validation';
import { z } from 'zod';

const CreateOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  tableId: z.string().uuid(),
});

export async function POST(request: Request) {
  const { data, error } = await validateBody(request, CreateOrderSchema);
  if (error) return error;
  // ... use data.restaurantId, data.tableId
}
```

## Endpoints

### Orders

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| POST   | `/api/orders`                  | Create new order    |
| GET    | `/api/orders/[orderId]`        | Get order details   |
| PATCH  | `/api/orders/[orderId]/status` | Update order status |
| POST   | `/api/orders/[orderId]/items`  | Add items to order  |

### Restaurants

| Method | Endpoint                             | Description            |
| ------ | ------------------------------------ | ---------------------- |
| GET    | `/api/restaurants/[slug]`            | Get restaurant by slug |
| GET    | `/api/restaurants/[slug]/menu`       | Get full menu          |
| GET    | `/api/restaurants/[slug]/categories` | List categories        |
| POST   | `/api/restaurants/[slug]/categories` | Create category        |
| GET    | `/api/restaurants/[slug]/products`   | List products          |
| POST   | `/api/restaurants/[slug]/products`   | Create product         |
| GET    | `/api/restaurants/[slug]/tables`     | List tables            |

### Sessions

| Method | Endpoint                     | Description            |
| ------ | ---------------------------- | ---------------------- |
| POST   | `/api/session/create`        | Create payment session |
| GET    | `/api/session/[id]`          | Get session details    |
| POST   | `/api/session/[id]/join`     | Join session           |
| GET    | `/api/session/[id]/validate` | Validate session       |

## Error Responses

All errors follow this format:

```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "details": [] // Optional array of validation issues
}
```

### Status Codes

| Code | Usage                       |
| ---- | --------------------------- |
| 400  | Validation error, bad input |
| 401  | Not authenticated           |
| 403  | Not authorized              |
| 404  | Resource not found          |
| 500  | Internal server error       |
