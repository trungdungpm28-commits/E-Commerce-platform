# E-Commerce Platform frontend

React, TypeScript, and Vite frontend for the e-commerce backend's sign-in and sign-up flow.

## Figma references

The two implemented desktop layouts are based on the inspected Figma frames **Sign In** (`8:2`) and **Sign Up 1** (`70:110`) in the “SignIn & SignUp” canvas. Both use a 1920×1080 presentation, a pale mint `#E2FFFD` page, a centered 923×759 white card with a 4px `#4B8681` border and offset shadow, `Kodchasan` headings/labels, and an `Inter` subtitle. The form uses square teal-outlined fields, pale transparent mint fills, and teal rectangular buttons. The layout reflows into a single-column form on narrow screens.

The signup design has no visible phone field or submit button, while the actual signup API requires `phone`. The implementation adds a required phone field and a “Sign up” submit button so account creation is usable and sends the real backend contract. The Figma frames show an “OR” divider and “Forgot password?” text, but the backend exposes no social-auth or password-reset endpoint; neither is wired to a fake action.

## Run locally

```sh
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the backend origin. The repository's backend does not contain an application bootstrap or a configured port, route prefix, or CORS policy; `.env.example` uses the conventional NestJS local port `3000` as a starting value, not a verified backend URL. The browser origin must be permitted by backend CORS configuration.

## Routes and authentication

- `/signin` sends `POST /auth/signin` with `{ email, password }`.
- `/signup` sends `POST /auth/signup` with `{ email, password, phone, firstName?, lastName? }`.
- Both auth responses contain `{ access_token }`. The frontend stores this bearer token in `localStorage` under `access_token`, then requests `GET /users/me`.
- On load, an existing token is restored through `GET /users/me`. HTTP 401 clears it; credential failures such as the backend's 403 do not clear an existing session.
- Sign out removes the local token. There is no backend logout, refresh-token, password-reset, social-login, or verification endpoint in the controllers, so these flows are not simulated.
- Registration response issues an access token, so the frontend uses it immediately and retrieves the current user.

## Implemented API mapping

All paths below are relative to `VITE_API_BASE_URL`. Authenticated endpoints use the shared bearer-token Axios client.

| Method | Path | Frontend function |
|---|---|---|
| POST | `/auth/signup` | `signUpRequest` |
| POST | `/auth/signin` | `signInRequest` |
| GET | `/users/me` | `getCurrentUser` |
| PATCH | `/users/me` | `updateCurrentUser` |
| PATCH | `/users/change-password` | `changePassword` |
| POST | `/users/addresses` | `createAddress` |
| GET | `/users/addresses` | `getAddresses` |
| DELETE | `/users/me` | `deleteCurrentUser` |
| DELETE | `/users/:id` | `deleteUser` |
| GET | `/products` | `getProducts` |
| GET | `/products/:id` | `getProduct` |
| POST | `/products` | `createProduct` |
| PATCH | `/products/:id/status` | `updateProductStatus` |
| DELETE | `/products/:id` | `deleteProduct` |
| GET | `/categories` | `getCategories` |
| POST | `/categories` | `createCategory` |
| DELETE | `/categories/:id` | `deleteCategory` |
| GET | `/categories/brands/all` | `getBrands` |
| POST | `/categories/brands` | `createBrand` |
| DELETE | `/categories/brands/:id` | `deleteBrand` |
| POST | `/shops` | `createShop` |
| GET | `/shops/my-shop` | `getMyShop` |
| PATCH | `/shops/my-shop` | `updateMyShop` |
| GET | `/shops` | `getShops` |
| PATCH | `/shops/:id/status` | `updateShopStatus` |
| DELETE | `/shops/my-shop` | `deleteMyShop` |
| DELETE | `/shops/:id` | `deleteShop` |
| GET | `/cart` | `getCart` |
| POST | `/cart/items` | `addToCart` |
| PATCH | `/cart/items/:id` | `updateCartItem` |
| DELETE | `/cart/items/:id` | `removeCartItem` |

The implemented controllers do not expose pagination, multipart upload, orders, or additional API modules.

## Backend contract caveats

The frontend request types follow the DTOs and controller routes. Several backend contracts disagree with its Prisma schema/service usage and may fail at runtime: address DTO fields do not match Prisma address columns; shop and brand DTOs use `logo` while models use `logoUrl`; product DTO/service assumes scalar `price` and image URLs even though the Prisma product model stores neither as those scalar fields; user profile editing refers to name fields absent from the User model. The user deletion-by-id controller also reads the authenticated user's ID instead of the `:id` route parameter, and both user-deletion endpoints return the deleted Prisma user record including `passwordHash`. These backend issues are documented rather than changed, per scope.

## Checks

```sh
npm run lint
npm run build
npm test
```

No live backend account or destructive endpoint is used by these checks.
